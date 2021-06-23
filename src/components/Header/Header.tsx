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

import React from 'react';
import { Grid, Hidden, makeStyles } from '@material-ui/core';
import { DatePicker } from '../DatePicker';
import { NamespaceMenu } from '../NamespaceMenu';

export const Header: React.FC = () => {
  const classes = useStyles();

  return (
    <Hidden implementation="js" smDown>
      <header className={classes.headerGrid}>
        <Grid container spacing={2} alignItems="center" justify="flex-end">
          <Grid item>
            <DatePicker />
          </Grid>
          <Grid item>
            <NamespaceMenu />
          </Grid>
        </Grid>
      </header>
    </Hidden>
  );
};

const useStyles = makeStyles((theme) => ({
  headerGrid: {
    margin: theme.spacing(3),
  },
}));
