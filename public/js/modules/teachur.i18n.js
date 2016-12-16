angular.module('teachur.i18n', ['pascalprecht.translate'])
.config(['$translateProvider', i18nConfig])
.controller('LangCtrl', ['$scope', '$translate', LangCtrl]);

        function i18nConfig($translateProvider) {

            $translateProvider.useStaticFilesLoader({
                prefix: window.baseUrl + '/i18n/resources-locale_',
                suffix: '.js'
            });

            $translateProvider.preferredLanguage('en');
            $translateProvider.usePostCompiling(true);
            $translateProvider.useSanitizeValueStrategy('sanitize');
        }


        // English, Español, 日本語, 中文, Deutsch, français, Italiano, Portugal, Русский язык, 한국어
        // Note: Used on Header, Sidebar, Footer, Dashboard
        // English:          EN-US
        // Spanish:          Español ES-ES
        // Chinese:          简体中文 ZH-CN
        // Chinese:          繁体中文 ZH-TW
        // French:           français FR-FR

        // Not used:
        // Portugal:         Portugal PT-BR
        // Russian:          Русский язык RU-RU
        // German:           Deutsch DE-DE
        // Japanese:         日本語 JA-JP
        // Italian:          Italiano IT-IT
        // Korean:           한국어 KO-KR


        function LangCtrl($scope, $translate) {
            $scope.lang = 'English';

            $scope.setLang = function(lang) {
                switch (lang) {
                    case 'English':
                        $translate.use('en');
                        break;
                    case 'Español':
                        $translate.use('es');
                        break;
                    case '中文':
                        $translate.use('zh');
                        break;
                    case '日本語':
                        $translate.use('ja');
                        break;
                    case 'Portugal':
                        $translate.use('pt');
                        break;
                    case 'Русский язык':
                        $translate.use('ru');
                        break;
                    case 'Hindi':
                        $translate.use('hi');
                        break;
                }
                return $scope.lang = lang;
        };
    }
