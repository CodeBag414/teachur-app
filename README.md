# teachur-app

## Install instructions
First, clone the repository and enter the folder you cloned the app to.
```shell
sudo npm install
sudo bower install
grunt
node .
```
Open http://localhost:8080 in your browser.


### How Translation works
- Translation works with the  [angular-translate library](https://github.com/angular-translate/angular-translate) 
- There is module that initiates the language negotiation that can be found in /public/modules/teachur.I18n.js
- That module is added as a dependency of the teachur module.
- By default the english language is set
- For each of the enabled languages there ia a translation file that can be found in /public/i18n/
- Each of this files follow the name convention resources-locale_[country-code].js
- When the user changes the languge using the language switcher, the associated translation file is loaded

#### Translation Strings
Now that the I18n is implemented no text should be harcoded in the views. Instead of harcoding text, a translation key needs to be placed added to all of the translation files with the appropiate translation. If no translation is available for one of the languages just use the english value.

When adding new translation strings to the files you need to make sure that that translation key or value is not already in the files, maybe other developer has tu put the same text on another screen. So just spend some seconds and do a quick search to make sure you are not creating any duplicate keys or values

##### Translation Strings Naming Convention
- use lower case for the keys
- user - to separate words
- in case of working on a section or component make use of a word as a namespace. So for instance all the fields in the create objective form have this prefix **objectives.create.some-field**

##### How to add translation strings
There are two ways of adding the translation strings and that will depend on the usecase.

1) it can be set as an attribute. This method is useful when the text is the only thing that is going to be inside the tag. ie an h1 tag
```
<h1 data-translate="translate-this-text"><h1>
<!-- result -->
<h1>This text is translated<h1>

```
2) it can be set inside curly brackets, this method is useful when you don't want the whole content of the tag is replaced by the translation string
```
<span><i class="some-fancy-icon"></i>{{"translate-this-text" | translate}}</span>
<!-- result -->
<span><i class="some-fancy-icon"></i>This text is translated</span>
```

## Troubleshooting

1.
 { [Error: Cannot find module '../build/Release/bson'] code: 'MODULE_NOT_FOUND' }

First make sure that you have mongoose installed
```shell
npm install mongoose@3.8.23
```
Second change bson reference as described here: http://stackoverflow.com/questions/28651028/cannot-find-module-build-release-bson-code-module-not-found-js-bson