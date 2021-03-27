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


angular.module('stats',
    ['baseBlockExplorer', 'restangular', 'datatables', 'datatables.bootstrap', 'ui.bootstrap', 'ui.router']);

angular.module('stats').constant('statsConfig', {
    'statsEndPoint': 'api'
});

angular.module('stats').config(['RestangularProvider', 'statsConfig', '$stateProvider', '$urlRouterProvider', 'baseConfig',
    function (RestangularProvider, statsConfig, $stateProvider, $urlRouterProvider, baseConfig) {
        RestangularProvider.setBaseUrl(baseConfig.apiUrl);

        $stateProvider.state('blockExplorer.stats', {
            url: '^/stats',
            templateUrl: './stats/stats.html',
            controller: 'StatsCtrl'

        });

    }]);
