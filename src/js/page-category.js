// Common modules
import './common'

// Page modules
var urlParameter = require('./get-url-parameter')
var accordion = require('./accordion')
var FindHelp = require('./find-help')
var apiRoutes = require('./api')

// Lodash
var sortBy = require('lodash/collection/sortBy')
var forEach = require('lodash/collection/forEach')
var findIndex = require('lodash/array/findIndex')

var getApiData = require('./get-api-data')
var templating = require('./template-render')
var Spinner = require('spin.js')
var analytics = require('./analytics')
var socialShare = require('./social-share')

// Spinner
var spin = document.getElementById('spin')
var loading = new Spinner().spin(spin)

var findHelp = new FindHelp()
findHelp.handleSubCategoryChange('sub-category', accordion)
findHelp.buildCategories(apiRoutes.categoryServiceProviders, buildList)

function buildList (url) {
  // Get API data using promise
  getApiData.data(url).then(function (result) {
    if (result.status === 'error') {
      window.location.replace('/find-help/')
    }
    var data = result.data

    var theTitle = data.name + ' - Street Support'
    document.title = theTitle

    var template = ''
    var callback = function () {}

    if (data.subCategories.length) {
      template = 'js-category-result-tpl'

      data.subCategories = sortBy(data.subCategories, function (item) {
        return item.name
      })

      forEach(data.subCategories, function (subCat) {
        forEach(subCat.serviceProviders, function (provider) {
          if (provider.tags !== null) {
            provider.tags = provider.tags.join(', ')
          }
        })
      })

      var subCategoryIndexToOpen = findIndex(data.subCategories, function (subCat) {
        return subCat.key === urlParameter.parameter('sub-category')
      })
    } else {
      template = 'js-category-no-results-result-tpl'
    }

    callback = function () {
      accordion.init(false, subCategoryIndexToOpen, findHelp.buildListener('category', 'sub-category'))
      loading.stop()
      socialShare.init()
    }

    analytics.init(theTitle)
    templating.renderTemplate(template, findHelp.buildViewModel('category', data), 'js-category-result-output', callback)
  })
}
