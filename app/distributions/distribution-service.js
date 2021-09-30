/******************************************************************************
 * Copyright © 2017 XIN Community                                             *
 *                                                                            *
 * See the DEVELOPER-AGREEMENT.txt and LICENSE.txt files at  the top-level    *
 * directory of this distribution for the individual copyright  holder        *
 * information and the developer policies on copyright and licensing.         *
 *                                                                            *
 * Unless otherwise agreed in a custom licensing agreement, no part of the    *
 * XIN software, including this file, may be copied, modified, propagated,    *
 * or distributed except according to the terms contained in the LICENSE.txt  *
 * file.                                                                      *
 *                                                                            *
 * Removal or modification of this copyright notice is prohibited.            *
 *                                                                            *
 ******************************************************************************/


angular.module('distributions').service('DistributionService',
    ['Restangular', 'distributionsConfig', 'baseConfig', function (Restangular, distributionsConfig, baseConfig) {

        this.getAccountBalances =
            function (index, pageSize) {

                var params = {
                    'requestType': 'getAccountBalances',
                    'index': index,
                    'size': pageSize,
                };

                Restangular.setBaseUrl( baseConfig.apiUrl);
                return Restangular.all(distributionsConfig.distributionsEndPoint).customGET('', params);

            };

        this.getDistributions =
            function (minAccountBalance, maxAccountBalance, slices) {

                var params = {
                    'requestType': 'getDistributions',
                    'minAccountBalance': minAccountBalance,
                    'maxAccountBalance': maxAccountBalance,
                    'slices': slices
                };

                Restangular.setBaseUrl( baseConfig.apiUrl);
                return Restangular.all(distributionsConfig.distributionsEndPoint).customGET('', params);

            };

    }]);
