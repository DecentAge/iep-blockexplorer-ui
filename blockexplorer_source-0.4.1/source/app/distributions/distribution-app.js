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

angular.module('distributions',
    ['restangular', 'datatables', 'datatables.bootstrap', 'ui.bootstrap', 'ui.router']);

angular.module('distributions').constant('distributionsConfig', {
    'distributionsUrl': 'http://185.35.137.7:23457',
    'distributionsEndPoint': 'api'
});

angular.module('distributions')
       .config(['RestangularProvider', 'distributionsConfig', '$stateProvider', '$urlRouterProvider', 'baseConfig',
           function (RestangularProvider, distributionsConfig, $stateProvider, $urlRouterProvider, baseConfig) {
               RestangularProvider.setBaseUrl(baseConfig.apiUrl);

               $stateProvider.state('blockExplorer.distributions', {
                   url: '^/distributions',
                   templateUrl: './distributions/distributions.html',
                   controller: 'DistributionsCtrl'

               });
           }]);
