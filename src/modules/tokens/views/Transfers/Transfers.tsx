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
  Box,
  Button,
  CircularProgress,
  Grid,
  TablePagination,
  Typography,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import dayjs from 'dayjs';
import FireIcon from 'mdi-react/FireIcon';
import StamperIcon from 'mdi-react/StamperIcon';
import SwapHorizontalIcon from 'mdi-react/SwapHorizontalIcon';
import MessageIcon from '@mui/icons-material/Message';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { DataTable } from '../../../../core/components/DataTable/DataTable';
import { DataTableEmptyState } from '../../../../core/components/DataTable/DataTableEmptyState';
import { HashPopover } from '../../../../core/components/HashPopover';
import { ApplicationContext } from '../../../../core/contexts/ApplicationContext';
import { NamespaceContext } from '../../../../core/contexts/NamespaceContext';
import {
  IDataTableRecord,
  ITokenPool,
  ITokenTransfer,
  ITokenTransferWithPool,
} from '../../../../core/interfaces';
import { fetchWithCredentials } from '../../../../core/utils';
import { useTokensTranslation } from '../../registration';
import { ArrayParam, useQueryParam, withDefault } from 'use-query-params';
import { FilterDisplay } from '../../../../core/components/FilterDisplay';
import { FilterModal } from '../../../../core/components/FilterModal';

const PAGE_LIMITS = [10, 25];

export const Transfers: () => JSX.Element = () => {
  const history = useHistory();
  const classes = useStyles();
  const { t } = useTokensTranslation();
  const [loading, setLoading] = useState(false);
  const [transfersUpdated, setTransfersUpdated] = useState(0);
  const [tokenTransfers, setTokenTransfers] = useState<
    ITokenTransferWithPool[]
  >([]);
  const [tokenTransfersTotal, setTokenTransfersTotal] = useState<number>(0);
  const { selectedNamespace } = useContext(NamespaceContext);
  const { lastEvent } = useContext(ApplicationContext);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_LIMITS[0]);
  const [filterAnchor, setFilterAnchor] = useState<HTMLButtonElement | null>(
    null
  );
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [filterString, setFilterString] = useState('');
  const [filterQuery, setFilterQuery] = useQueryParam(
    'filters',
    withDefault(ArrayParam, [])
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    if (
      newPage > currentPage &&
      rowsPerPage * (currentPage + 1) >= tokenTransfersTotal
    ) {
      return;
    }
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCurrentPage(0);
    setRowsPerPage(+event.target.value);
  };

  const pagination = (
    <TablePagination
      component="div"
      count={-1}
      rowsPerPage={rowsPerPage}
      page={currentPage}
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      rowsPerPageOptions={PAGE_LIMITS}
      labelDisplayedRows={({ from, to }) => `${from} - ${to}`}
      className={classes.pagination}
    />
  );

  useEffect(() => {
    if (lastEvent && lastEvent.data) {
      const eventJson = JSON.parse(lastEvent.data);
      if (eventJson.type === 'token_transfer_confirmed') {
        setTransfersUpdated(new Date().getTime());
      }
    }
  }, [lastEvent]);

  useEffect(() => {
    setLoading(true);
    fetchWithCredentials(
      `/api/v1/namespaces/${selectedNamespace}/tokens/transfers?limit=${rowsPerPage}&skip=${
        rowsPerPage * currentPage
      }&count${filterString !== undefined ? filterString : ''}`
    )
      .then(async (tokenTransfersResponse) => {
        if (tokenTransfersResponse.ok) {
          const tokenTransfers = await tokenTransfersResponse.json();
          setTokenTransfersTotal(tokenTransfers.total);

          if (tokenTransfers.count > 0) {
            const transfersWithPool: ITokenTransferWithPool[] = [];
            for (const transfer of tokenTransfers.items as ITokenTransfer[]) {
              const pool = await fetchPool(selectedNamespace, transfer.pool);
              if (pool !== undefined) {
                transfersWithPool.push({
                  ...transfer,
                  poolName: pool.name,
                });
              }
            }
            setTokenTransfers(transfersWithPool);
          } else {
            setTokenTransfers([]);
          }
        } else {
          console.log('error fetching token transfers');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [
    rowsPerPage,
    currentPage,
    selectedNamespace,
    transfersUpdated,
    filterString,
  ]);

  useEffect(() => {
    // set filters if they are present in the URL
    if (filterQuery.length !== 0) {
      setActiveFilters(filterQuery as string[]);
    }
  }, [setActiveFilters, filterQuery]);

  useEffect(() => {
    //set query param state
    setFilterQuery(activeFilters, 'replaceIn');
    if (activeFilters.length === 0) {
      setFilterString('');
      return;
    }

    setFilterString(`&${activeFilters.join('&')}`);
  }, [activeFilters, setFilterQuery]);

  const handleOpenFilter = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchor(event.currentTarget);
  };

  const handleAddFilter = (filter: string) => {
    setActiveFilters((activeFilters) => [...activeFilters, filter]);
  };

  const transferIconMap = {
    burn: <FireIcon />,
    mint: <StamperIcon />,
    transfer: <SwapHorizontalIcon />,
  };

  const tokenTransfersColumnHeaders = [
    t('txHash'),
    t('pool'),
    t('method'),
    t('tokenIndex'),
    t('amount'),
    t('from'),
    t('to'),
    t('message'),
    t('timestamp'),
  ];

  const tokenTransfersRecords: IDataTableRecord[] = tokenTransfers.map(
    (tokenTransfer: ITokenTransferWithPool) => ({
      key: tokenTransfer.tx.id,
      columns: [
        {
          value: (
            <Grid
              container
              direction="row"
              justifyContent="flex-start"
              alignItems="center"
            >
              <Grid item>{transferIconMap[tokenTransfer.type]}</Grid>
              <Grid item>
                <HashPopover
                  shortHash={true}
                  textColor="primary"
                  address={tokenTransfer.tx.id}
                />
              </Grid>
            </Grid>
          ),
        },
        { value: tokenTransfer.poolName },
        { value: t(tokenTransfer.type) },
        { value: tokenTransfer.tokenIndex ?? t('emptyPlaceholder') },
        { value: tokenTransfer.amount },
        {
          value: tokenTransfer.from ? (
            <HashPopover
              shortHash={true}
              textColor="primary"
              address={tokenTransfer.from}
            />
          ) : (
            t('emptyPlaceholder')
          ),
        },
        {
          value: tokenTransfer.to ? (
            <HashPopover
              shortHash={true}
              textColor="primary"
              address={tokenTransfer.to}
            />
          ) : (
            t('emptyPlaceholder')
          ),
        },
        {
          value: tokenTransfer.message === undefined ? '' : <MessageIcon />,
        },
        { value: dayjs(tokenTransfer.created).format('MM/DD/YYYY h:mm A') },
      ],
      onClick: () => {
        history.push(
          `/namespace/${selectedNamespace}/tokens/transfers/${tokenTransfer.localId}`
        );
      },
    })
  );

  if (loading) {
    return (
      <Box className={classes.centeredContent}>
        <CircularProgress />
      </Box>
    );
  }

  const filterFields = [
    'amount',
    'blockchainevent',
    'created',
    'from',
    'key',
    'localid',
    'message',
    'messagehash',
    'namespace',
    'protocolid',
    'to',
    'tokenindex',
    'tx.id',
    'tx.type',
    'uri',
  ];

  return (
    <>
      <Grid container justifyContent="center">
        <Grid container wrap="nowrap" direction="column">
          <Grid container item direction="row">
            <Grid className={classes.headerContainer} item>
              <Typography variant="h4" className={classes.header}>
                {t('transfers')}
              </Typography>
            </Grid>
            <Box className={classes.separator} />
            <Grid item>
              <Button
                className={classes.filterButton}
                variant="outlined"
                onClick={handleOpenFilter}
              >
                <Typography>{t('filter')}</Typography>
              </Button>
            </Grid>
          </Grid>
          {activeFilters.length > 0 && (
            <Grid container className={classes.filterContainer}>
              <FilterDisplay
                filters={activeFilters}
                setFilters={setActiveFilters}
              />
            </Grid>
          )}
          <Grid container item>
            {tokenTransfers.length ? (
              <DataTable
                stickyHeader={true}
                minHeight="300px"
                maxHeight="calc(100vh - 340px)"
                columnHeaders={tokenTransfersColumnHeaders}
                records={tokenTransfersRecords}
                {...{ pagination }}
              />
            ) : (
              <DataTableEmptyState
                message={t('noTokenTransfersToDisplay')}
              ></DataTableEmptyState>
            )}
          </Grid>
        </Grid>
      </Grid>
      {filterAnchor && (
        <FilterModal
          anchor={filterAnchor}
          onClose={() => {
            setFilterAnchor(null);
          }}
          fields={filterFields}
          addFilter={handleAddFilter}
        />
      )}
    </>
  );
};

const poolCache = new Map<string, ITokenPool>();
const fetchPool = async (
  namespace: string,
  id: string
): Promise<ITokenPool | undefined> => {
  if (poolCache.has(id)) {
    return poolCache.get(id);
  }
  const response = await fetchWithCredentials(
    `/api/v1/namespaces/${namespace}/tokens/pools/${id}`
  );
  if (!response.ok) {
    return undefined;
  }
  const pool = await response.json();
  poolCache.set(id, pool);
  return pool;
};

const useStyles = makeStyles((theme) => ({
  centeredContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: 'calc(100vh - 300px)',
    overflow: 'auto',
  },
  header: {
    fontWeight: 'bold',
  },
  headerContainer: {
    marginBottom: theme.spacing(5),
  },
  pagination: {
    color: theme.palette.text.secondary,
  },
  separator: {
    flexGrow: 1,
  },
  filterContainer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  filterButton: {
    height: 40,
  },
}));
