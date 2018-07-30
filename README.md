ng-hijri-gregorian-datepicker
===

Lightweight Angular.js hijri and gregorian datepicker directive built with Moment.js.

![ng-hijri-gregorian-datepicker screenshot](https://imgur.com/a/BHuO4c1)

## Demo

[See demo](http://remiawe.github.io/ng-hijri-gregorian-datepicker/)

## Features
* Custom ng-model date format: custom string or js date
* Easy to switch between Hijri and Gregorian
* Set default date view ( Hijri | Gregorian )
* Set date format for ( Hijri | Gregorian | Display)
* Min date / Max date
* Allow/disallow future / past date selection
* Quick selection of month and year
* Locale aware (Angular and Moment locale)

## Requirements
* Angularjs >=1.2
* Moment.js
* Moment-hijri.js

## Installation

1. `npm install --save ng-hijri-gregorian-datepicker`
2. Link `/dist/ng-hijri-gregorian-datepicker.js`and `/dist/ng-hijri-gregorian-datepicker.css`
3. Add the module `'ngHijriGregorianDatepicker'` as dependency of your angular module.

## Usage

This is an attribute only directive.

```html
<input type="text" ng-model="date" ng-hijri-gregorian-datepicker>
```

```html
<button ng-model="date" ng-hijri-gregorian-datepicker>Pick a date</button>
```

## Options

### Attributes:
* `datepicker-config`: **Object** - The datepicker's config object.
* `selected-date`: **Object** - returns the selected value in this format {"hijri":"18/11/1439","gregorian":"31/07/2018"}.

```html
<input type="text" ng-model="date" datepicker-config="yourCustomConf" ng-hijri-gregorian-datepicker>Pick a date</button>
```

### Config object properties:

* `dateFormat`: **String** - The Moment.js format of the date in the `ng-model`. Fallback to js date Object if no format is given. Eg: `'DD/MM/YYYY'`.
* `minDate`: **Object** - The minimum selectable date. Must be a Moment Date Object.
* `maxDate`: **Object** - The maximum selectable date. Must be a Moment Date Object.
* `allowFuture`: **Boolean** - Maximum selectable date is today
* `allowPast`: **Boolean** - Minimum selectable date is today
* `gregorianDateFormat`: **String** - Must be a Moment valid format.
* `hijriDateFormat`: **String** - Must be a Moment-hijri valid format.
* `defaultDisplay:`: **String** - 'gregorian' or 'hijri'.
* `maxDate`: **String** - Must be a Moment valid locale.


### Locale
Default locale is english but you can load any locale of your choice (Angular and Moment), the datepicker use the currents locales.

## Contributions
Just install the dev dependencies and start a `gulp watch`

## Credits
Fork from: [RemiAWE](https://github.com/RemiAWE/ng-flat-datepicker)
