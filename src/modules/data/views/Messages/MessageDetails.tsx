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

import React, { useState, useEffect, useContext } from 'react';
import { DisplaySlide } from '../../../../core/components/Display/DisplaySlide';
import {
  Typography,
  Grid,
  Divider,
  Button,
  Box,
  Paper,
  CircularProgress,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { IMessage, IBatch, IData } from '../../../../core/interfaces';
import { HashPopover } from '../../../../core/components/HashPopover';
import dayjs from 'dayjs';
import CopyToClipboard from 'react-copy-to-clipboard';
import clsx from 'clsx';
import { NamespaceContext } from '../../../../core/contexts/NamespaceContext';
import { useHistory } from 'react-router-dom';
import Highlight from 'react-highlight';
import { fetchWithCredentials } from '../../../../core/utils';
import { SnackbarContext } from '../../../../core/contexts/SnackbarContext';
import { useDataTranslation } from '../../registration';

interface Props {
  message: IMessage;
  open: boolean;
  onClose: () => void;
}

export const MessageDetails: React.FC<Props> = ({ message, open, onClose }) => {
  const { t } = useDataTranslation();
  const classes = useStyles();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [txId, setTxId] = useState<string>();
  const [data, setData] = useState<IData[]>([]);
  const { selectedNamespace } = useContext(NamespaceContext);
  const { setMessage, setMessageType } = useContext(SnackbarContext);

  const detailItem = (label: string, value: string | JSX.Element) => (
    <>
      <Grid item xs={12}>
        <Typography className={classes.detailLabel}>{label}</Typography>
      </Grid>
      <Grid item xs={12}>
        {value}
      </Grid>
    </>
  );

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchWithCredentials(
        `/api/v1/namespaces/${selectedNamespace}/batches/${message.batch}`
      ),
      fetchWithCredentials(
        `/api/v1/namespaces/${selectedNamespace}/messages/${message.header.id}?data`
      ),
    ])
      .then(async ([batchResponse, messageDataResponse]) => {
        if (batchResponse.ok && messageDataResponse.ok) {
          setData((await messageDataResponse.json()).data);
          const batch: IBatch = await batchResponse.json();
          setTxId(batch.payload.tx.id);
        } else {
          setMessageType('error');
          setMessage(`Error loading details for message ${message.header.id}`);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [
    message.batch,
    selectedNamespace,
    message.header.id,
    setMessage,
    setMessageType,
  ]);

  const copyableHash = (hash: string) => (
    <Grid alignItems="center" container direction="row">
      <Grid item xs={8}>
        <Typography
          title={hash}
          noWrap
          className={clsx(classes.detailValue, classes.paddingRight)}
        >
          {hash}
        </Typography>
      </Grid>
      <Grid item xs={4}>
        <CopyToClipboard text={hash}>
          <Button size="small" className={classes.copyButton}>
            {t('copy')}
          </Button>
        </CopyToClipboard>
      </Grid>
    </Grid>
  );

  const transactionLink = (txId: string | undefined) => (
    <Grid
      alignItems="center"
      container
      direction="row"
      justifyContent="space-between"
    >
      <Grid item xs={8}>
        <Typography
          noWrap
          className={clsx(classes.detailValue, classes.paddingRight)}
        >
          {txId}
        </Typography>
      </Grid>
      {txId && (
        <Grid item xs={4}>
          <Button
            size="small"
            className={classes.copyButton}
            onClick={() =>
              history.push(
                `/namespace/${selectedNamespace}/data/transactions/${txId}` +
                  history.location.search,
                {
                  props: { message: message, open: open },
                }
              )
            }
          >
            {t('viewTx')}
          </Button>
        </Grid>
      )}
    </Grid>
  );

  if (loading) {
    return (
      <Box className={classes.centeredContent}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <DisplaySlide open={open} onClose={onClose}>
        <Grid container direction="column">
          <Grid className={classes.headerContainer} item>
            <Typography className={classes.header}>
              {t('messageDetail')}
            </Typography>
          </Grid>
          <Grid
            className={classes.detailsContainer}
            container
            item
            direction="row"
          >
            <Grid className={classes.detailItem} sm={12} md={6} container item>
              {detailItem(t('id'), <HashPopover address={message.header.id} />)}
            </Grid>
            <Grid className={classes.detailItem} sm={12} md={6} container item>
              {detailItem(t('tag'), message.header.tag)}
            </Grid>
            <Grid className={classes.detailItem} sm={12} md={6} container item>
              {detailItem(t('type'), message.header.type)}
            </Grid>
            <Grid className={classes.detailItem} sm={12} md={6} container item>
              {detailItem(t('transactionType'), message.header.txtype)}
            </Grid>
            <Grid className={classes.detailItem} sm={12} md={6} container item>
              {detailItem(
                t('author'),
                <HashPopover address={message.header.author} />
              )}
            </Grid>
            <Grid className={classes.detailItem} sm={12} md={6} container item>
              {detailItem(
                t('createdOn'),
                dayjs(message.header.created).format('MM/DD/YYYY h:mm A')
              )}
            </Grid>
          </Grid>
          <Divider className={classes.divider} />
          <Grid
            className={classes.detailsContainer}
            container
            item
            direction="row"
          >
            <Grid className={classes.detailItem} sm={12} container item>
              {detailItem(t('transaction'), transactionLink(txId))}
            </Grid>
            <Grid className={classes.detailItem} sm={12} container item>
              {detailItem(t('dataHash'), copyableHash(message.header.datahash))}
            </Grid>
          </Grid>
          {data.map((item) => (
            <Grid
              container
              className={classes.dataContainer}
              item
              key={item.id}
            >
              <Grid item>
                <Paper className={classes.paper}>
                  <Highlight>{JSON.stringify(item.value, null, 2)}</Highlight>
                </Paper>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </DisplaySlide>
    </>
  );
};

const useStyles = makeStyles((theme) => ({
  detailsContainer: {
    padding: theme.spacing(3),
  },
  detailItem: {
    paddingBottom: theme.spacing(1),
  },
  header: {
    fontWeight: 'bold',
  },
  headerContainer: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingTop: theme.spacing(3),
  },
  detailLabel: {
    fontSize: 10,
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 14,
  },
  divider: {
    backgroundColor: theme.palette.background.default,
    height: 2,
  },
  copyButton: {
    backgroundColor: theme.palette.primary.dark,
    borderRadius: 20,
    fontSize: 10,
  },
  paddingRight: {
    paddingRight: theme.spacing(1),
  },
  centeredContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: 'calc(100vh - 300px)',
    overflow: 'auto',
  },
  paper: {
    backgroundColor: theme.palette.background.default,
    minWidth: '40vw',
  },
  dataContainer: {
    overflow: 'auto',
  },
}));
