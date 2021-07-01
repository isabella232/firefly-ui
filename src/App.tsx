// Copyright © 2021 Kaleido, Inc.
//
// SPDX-License-Identifier: Apache-2.0
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React, { useEffect, useState, useRef } from 'react';
import { Router, Switch, Route } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import {
  ThemeProvider,
  CssBaseline,
  CircularProgress,
  createMuiTheme,
} from '@material-ui/core';
import { Dashboard } from './views/Dashboard';
import { Messages } from './views/Messages/Messages';
import { Transactions } from './views/Transactions/Transactions';
import { TransactionDetails } from './views/Transactions/TransactionDetails';
import { Data } from './views/Data/Data';
import { AppWrapper } from './components/AppWrapper';
import { NamespaceContext } from './contexts/NamespaceContext';
import { ApplicationContext } from './contexts/ApplicationContext';
import {
  INamespace,
  DataView,
  CreatedFilterOptions,
  IStatus,
} from './interfaces';
import ReconnectingWebsocket from 'reconnecting-websocket';
import { fetchWithCredentials } from './utils';
import { QueryParamProvider } from 'use-query-params';

const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
const history = createBrowserHistory({
  basename: process.env.PUBLIC_URL,
});
export const NAMESPACE_LOCALSTORAGE_KEY = 'ff:namespace';
export const theme = createMuiTheme({
  palette: {
    type: 'dark',
    background: {
      default: '#1E242A',
      paper: '#252C32',
    },
    text: {
      secondary: '#9BA7B0',
    },
    action: {
      active: '#1E242A',
    },
    tableRowAlternate: {
      main: '#21272D',
    },
    timelineBackground: {
      main: '#2D353C',
    },
  },
  overrides: {
    MuiListItem: {
      gutters: {
        paddingLeft: 25,
        paddingRight: 25,
      },
    },
    MuiSelect: {
      root: {
        color: '#6E7780',
      },
      select: {
        '&:focus': {
          backgroundColor: '#1E242A',
        },
      },
      icon: {
        color: '#6E7780',
      },
    },
    MuiOutlinedInput: {
      root: {
        '&:hover $notchedOutline': {
          borderColor: '#9BA7B0',
        },
        '&$focused $notchedOutline': {
          borderColor: '#9BA7B0',
        },
      },
    },
    MuiFormLabel: {
      root: {
        '&$focused': {
          backgroundColor: '#1E242A',
          color: '#6E7780',
        },
      },
    },
  },
});

function App(): JSX.Element {
  const [initializing, setInitializing] = useState(true);
  const [namespaces, setNamespaces] = useState<INamespace[]>([]);
  const [selectedNamespace, setSelectedNamespace] = useState<string>('');
  const [dataView, setDataView] = useState<DataView>('list');
  const [identity, setIdentity] = useState('');
  const [orgName, setOrgName] = useState('');
  const [createdFilter, setCreatedFilter] =
    useState<CreatedFilterOptions>('24hours');
  const ws = useRef<ReconnectingWebsocket | null>(null);
  const [lastEvent, setLastEvent] = useState<any>();

  useEffect(() => {
    Promise.all([
      fetchWithCredentials('/api/v1/namespaces'),
      fetchWithCredentials('/api/v1/status'),
    ])
      .then(async ([namespaceResponse, statusResponse]) => {
        if (namespaceResponse.ok && statusResponse.ok) {
          const status: IStatus = await statusResponse.json();
          setIdentity(status.org.identity);
          setOrgName(status.org.name);
          const ns: INamespace[] = await namespaceResponse.json();
          setNamespaces(ns);
          setSelectedNamespace(status.defaults.namespace);
        }
      })
      .finally(() => {
        setInitializing(false);
      });
  }, []);

  useEffect(() => {
    if (selectedNamespace) {
      ws.current = new ReconnectingWebsocket(
        `${protocol}://${window.location.hostname}:${window.location.port}/ws?namespace=${selectedNamespace}&ephemeral&autoack`
      );
      ws.current.onmessage = (event: any) => {
        setLastEvent(event);
      };
    }
  }, [selectedNamespace]);

  if (initializing) {
    return <CircularProgress />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NamespaceContext.Provider
        value={{
          namespaces,
          selectedNamespace,
          setNamespaces,
          setSelectedNamespace,
        }}
      >
        <ApplicationContext.Provider
          value={{
            orgName,
            identity,
            dataView,
            setDataView,
            lastEvent,
            setLastEvent,
            createdFilter,
            setCreatedFilter,
          }}
        >
          <Router history={history}>
            <QueryParamProvider ReactRouterRoute={Route}>
              <AppWrapper>
                <Switch>
                  <Route exact path="/" render={() => <Dashboard />} />
                  <Route exact path="/messages" render={() => <Messages />} />
                  <Route exact path="/data" render={() => <Data />} />
                  <Route
                    exact
                    path="/transactions"
                    render={() => <Transactions />}
                  />
                  <Route
                    exact
                    path="/transactions/:id"
                    render={() => <TransactionDetails />}
                  />
                </Switch>
              </AppWrapper>
            </QueryParamProvider>
          </Router>
        </ApplicationContext.Provider>
      </NamespaceContext.Provider>
    </ThemeProvider>
  );
}

export default App;
