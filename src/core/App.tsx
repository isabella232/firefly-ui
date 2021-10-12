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

import {
  ThemeProvider,
  Theme,
  StyledEngineProvider,
  CssBaseline,
  createTheme,
  adaptV4Theme,
} from '@mui/material';
import { Routes } from './components/Routes';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

export const theme = createTheme(
  adaptV4Theme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#FFFFFF',
      },
      secondary: {
        main: '#9BA7B0',
      },
      background: {
        default: '#1E242A',
        paper: '#252C32',
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#9BA7B0',
      },
      action: {
        active: '#1E242A',
      },
    },
    mixins: {
      toolbar: {
        height: '66px',
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
      MuiPaper: {
        root: { backgroundImage: 'unset' },
      },
    },
  })
);

function App(): JSX.Element {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider {...{ theme }}>
        <CssBaseline />
        <Routes />
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;
