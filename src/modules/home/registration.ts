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

import HomeOutlineIcon from 'mdi-react/HomeOutlineIcon';
import useModuleTranslation from '../../core/hooks/useModuleTranslation';
import { IRoute, NavItem } from '../../core/interfaces';
import { Home } from './views/Home';
import i18n from 'i18next';
import enData from './translations/en.json';

// Translations

const HOME_TRANSLATIONS_NS = 'home';
export const registerHomeTranslations = (): void => {
  i18n.addResourceBundle('en', HOME_TRANSLATIONS_NS, enData);
};
export const useHomeTranslation = (): { t: (key: string) => string } => {
  return useModuleTranslation(HOME_TRANSLATIONS_NS);
};

// Navigation

export const HomeAppNavItem: NavItem = {
  translationNs: HOME_TRANSLATIONS_NS,
  translationKey: 'home',
  icon: HomeOutlineIcon,
  routesRequireNamespace: false,
  makePathname: () => `/`,
  isActiveCheck: (_ns?: string, pathname?: string) => pathname === `/`,
};

// Routes

export const HomeRoutes: IRoute[] = [
  {
    exact: true,
    route: '/',
    component: Home,
  },
];
