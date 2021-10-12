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

import React, { useContext } from 'react';
import { Grid, Typography, Box } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { ApplicationContext } from '../../../../core/contexts/ApplicationContext';
import { DataViewSwitch } from '../../../../core/components/DataViewSwitch';
import { FilterSelect } from '../../../../core/components/FilterSelect';
import { TransactionList } from './TransactionList';
import { TransactionTimeline } from './TransactionTimeline';
import { useDataTranslation } from '../../registration';

export const Transactions: () => JSX.Element = () => {
  const { t } = useDataTranslation();
  const classes = useStyles();
  const { dataView, createdFilter, setCreatedFilter } =
    useContext(ApplicationContext);

  const createdQueryOptions = [
    {
      value: '24hours',
      label: t('last24Hours'),
    },
    {
      value: '7days',
      label: t('last7Days'),
    },
    {
      value: '30days',
      label: t('last30Days'),
    },
  ];

  return (
    <Grid container justifyContent="center">
      <Grid container item wrap="nowrap" direction="column">
        <Grid container spacing={2} item direction="row">
          <Grid item>
            <Typography className={classes.header} variant="h4">
              {t('transactions')}
            </Typography>
          </Grid>
          <Box className={classes.separator} />
          <Grid item>
            <FilterSelect
              filter={createdFilter}
              setFilter={setCreatedFilter}
              filterItems={createdQueryOptions}
            />
          </Grid>
          <Grid item>
            <DataViewSwitch />
          </Grid>
        </Grid>
        {dataView === 'timeline' && (
          <Grid className={classes.timelineContainer} xs={12} container item>
            <TransactionTimeline />
          </Grid>
        )}
        {dataView === 'list' && (
          <Grid container item>
            <TransactionList />
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles((theme) => ({
  header: {
    fontWeight: 'bold',
  },
  pagination: {
    color: theme.palette.text.secondary,
  },
  centeredContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: 'calc(100vh - 300px)',
    overflow: 'auto',
  },
  timelineContainer: {
    paddingTop: theme.spacing(4),
  },
  separator: {
    flexGrow: 1,
  },
}));
