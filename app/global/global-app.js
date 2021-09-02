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


angular.module('blockExplorer',
    ['blocks', 'assets', 'currency', 'poll', 'unconfirmedTransactions', 'transactions', 'search', 'accounts', 'stats',
        'ui.router','distributions']);

angular.module('blockExplorer')
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider.state('blockExplorer', {
            abstract: true,
            url: '/',
            template: '<div ui-view></div>',
        });

        $urlRouterProvider.otherwise('/blocks')

        document.title = "Infinity Block Explorer | " + window.getEnvConfig("NETWORK_ENVIRONMENT");
    }]);

angular.module('blockExplorer').run(['$rootScope', 'BASE_OPTIONS', function ($rootScope, BASE_OPTIONS) {
    $rootScope.options = BASE_OPTIONS;

    $rootScope.formatDate = function(d, withTime) {
        if (!d || typeof d === "undefined") {
            return "n/a";
        }
        if (typeof withTime === "undefined") {
            withTime = false;
        }

        var browserLocale = navigator.language || navigator.userLanguage || "en-US";

        var date = new Date(d);

        return date.toLocaleDateString(browserLocale) + (withTime ? ' <strong>' + date.toLocaleTimeString(browserLocale) + '</strong>' : "");
    }
}]);
