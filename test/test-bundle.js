(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function Common() {}

Common.prototype.exampleMethod = function () {
    return 'I am an example';
};

var common = Common;

function CommerceHandler(common) {
  this.common = common || {};
}

CommerceHandler.prototype.logCommerceEvent = function(event) {
  /*
      Sample ecommerce event schema:
      {
          CurrencyCode: 'USD',
          DeviceId:'a80eea1c-57f5-4f84-815e-06fe971b6ef2', // MP generated
          EventAttributes: { key1: 'value1', key2: 'value2' },
          EventType: 16,
          EventCategory: 10, // (This is an add product to cart event, see below for additional ecommerce EventCategories)
          EventName: "eCommerce - AddToCart",
          MPID: "8278431810143183490",
          ProductAction: {
              Affiliation: 'aff1',
              CouponCode: 'coupon',
              ProductActionType: 7,
              ProductList: [
                  {
                      Attributes: { prodKey1: 'prodValue1', prodKey2: 'prodValue2' },
                      Brand: 'Apple',
                      Category: 'phones',
                      CouponCode: 'coupon1',
                      Name: 'iPhone',
                      Price: '600',
                      Quantity: 2,
                      Sku: "SKU123",
                      TotalAmount: 1200,
                      Variant: '64GB'
                  }
              ],
              TransactionId: "tid1",
              ShippingAmount: 10,
              TaxAmount: 5,
              TotalAmount: 1215,
          },
          UserAttributes: { userKey1: 'userValue1', userKey2: 'userValue2' }
          UserIdentities: [
              {
                  Identity: 'test@gmail.com', Type: 7
              }
          ]
      }
      If your SDK has specific ways to log different eCommerce events, see below for
      mParticle's additional ecommerce EventCategory types:
          10: ProductAddToCart, (as shown above)
          11: ProductRemoveFromCart,
          12: ProductCheckout,
          13: ProductCheckoutOption,
          14: ProductClick,
          15: ProductViewDetail,
          16: ProductPurchase,
          17: ProductRefund,
          18: PromotionView,
          19: PromotionClick,
          20: ProductAddToWishlist,
          21: ProductRemoveFromWishlist,
          22: ProductImpression
      */
};

var commerceHandler = CommerceHandler;

/*
A non-ecommerce event has the following schema:
{
    DeviceId: "a80eea1c-57f5-4f84-815e-06fe971b6ef2",
    EventAttributes: {test: "Error", t: 'stack trace in string form'},
    EventName: "Error",
    MPID: "123123123123",
    UserAttributes: {userAttr1: 'value1', userAttr2: 'value2'},
    UserIdentities: [{Identity: 'email@gmail.com', Type: 7}]
    User Identity Types can be found here:
}
*/

function EventHandler(common) {
  this.common = common || {};
}
EventHandler.prototype.logEvent = function(event) {};
EventHandler.prototype.logError = function(event) {
  // The schema for a logError event is the same, but noteworthy differences are as follows:
  // {
  //     EventAttributes: {m: 'name of error passed into MP', s: "Error", t: 'stack trace in string form if applicable'},
  //     EventName: "Error"
  // }
};
EventHandler.prototype.logPageView = function(event) {
  /* The schema for a logPagView event is the same, but noteworthy differences are as follows:
      {
          EventAttributes: {hostname: "www.google.com", title: 'Test Page'},  // These are event attributes only if no additional event attributes are explicitly provided to mParticle.logPageView(...)
      }
      */
};

var eventHandler = EventHandler;

var initialization = {
    name: 'Didomi',
    moduleId: 168,
    purposesMapping: {},
    initForwarder: function(forwarderSettings) {
        this.purposesMapping = this.parsePurposesMapping(
            forwarderSettings.purposes
        );

        var self = this;
        window.didomiEventListeners = window.didomiEventListeners || [];
        window.didomiEventListeners.push({
            event: 'consent.changed',
            listener: function (context) {
                self.generateConsentEvent();
            }
        });
    },
    generateConsentEvent: function() {
        var location = window.location.href;
        var didomiUser = Didomi.getUserStatus();
        var mParticleUser = mParticle.Identity.getCurrentUser();
        var consentState = null;

        if (mParticleUser) {
            consentState = mParticleUser.getConsentState();
            if (!consentState) {
                consentState = mParticle.Consent.createConsentState();
            }
            for (var didomiPurpose in this.purposesMapping) {
                var mParticlePurpose = this.purposesMapping[didomiPurpose];

                var purposeConsentSatus = this.getPurposeStatusFromDidomiUser(didomiUser, didomiPurpose);
                var mParticleConsentForPurpose = mParticle.Consent.createGDPRConsent(purposeConsentSatus, Date.now(), mParticlePurpose, location);
                consentState.addGDPRConsentState(mParticlePurpose, mParticleConsentForPurpose);
            }

            mParticleUser.setConsentState(consentState);
        }
    },
    getPurposeStatusFromDidomiUser: function (didomiUser, purposeName) {
        var enabledConsentPurposes = didomiUser.purposes.consent.enabled;
        var enabledLIPurposes = didomiUser.purposes.legitimate_interest.enabled;
        var enabledPurposes = [...enabledConsentPurposes, ...enabledLIPurposes];

        return enabledPurposes.indexOf(purposeName) > -1;
    },
    parsePurposesMapping: function(rawPurposesMapping) {
        var purposesMap = {};
        var parsedPurposesMapping = JSON.parse(rawPurposesMapping.replace(/&quot;/g, '\"')) || [];

        for (var purposeMap of parsedPurposesMapping) {
            purposesMap[purposeMap.value] = purposeMap.map;
        }

        return purposesMap;
    },
};

var initialization_1 = initialization;

/*
The 'mParticleUser' is an object with methods get user Identities and set/get user attributes
Partners can determine what userIds are available to use in their SDK
Call mParticleUser.getUserIdentities() to return an object of userIdentities --> { userIdentities: {customerid: '1234', email: 'email@gmail.com'} }
For more identity types, see http://docs.mparticle.com/developers/sdk/javascript/identity#allowed-identity-types
Call mParticleUser.getMPID() to get mParticle ID
For any additional methods, see http://docs.mparticle.com/developers/sdk/javascript/apidocs/classes/mParticle.Identity.getCurrentUser().html
*/

/*
identityApiRequest has the schema:
{
  userIdentities: {
    customerid: '123',
    email: 'abc'
  }
}
For more userIdentity types, see http://docs.mparticle.com/developers/sdk/javascript/identity#allowed-identity-types
*/


function IdentityHandler(common) {
  this.common = common || {};
}
IdentityHandler.prototype.onUserIdentified = function(mParticleUser) {
  initialization_1.generateConsentEvent();
};
IdentityHandler.prototype.onIdentifyComplete = function(
  mParticleUser,
  identityApiRequest
) {};
IdentityHandler.prototype.onLoginComplete = function(
  mParticleUser,
  identityApiRequest
) {};
IdentityHandler.prototype.onLogoutComplete = function(
  mParticleUser,
  identityApiRequest
) {};
IdentityHandler.prototype.onModifyComplete = function(
  mParticleUser,
  identityApiRequest
) {};

/*  In previous versions of the mParticle web SDK, setting user identities on
  kits is only reachable via the onSetUserIdentity method below. We recommend
  filling out `onSetUserIdentity` for maximum compatibility
*/
IdentityHandler.prototype.onSetUserIdentity = function(
  forwarderSettings,
  id,
  type
) {};

var identityHandler = IdentityHandler;

var sessionHandler = {
  onSessionStart: function(event) {
      
  },
  onSessionEnd: function(event) {

  }
};

var sessionHandler_1 = sessionHandler;

/*
The 'mParticleUser' is an object with methods on it to get user Identities and set/get user attributes
Partners can determine what userIds are available to use in their SDK
Call mParticleUser.getUserIdentities() to return an object of userIdentities --> { userIdentities: {customerid: '1234', email: 'email@gmail.com'} }
For more identity types, see http://docs.mparticle.com/developers/sdk/javascript/identity#allowed-identity-types
Call mParticleUser.getMPID() to get mParticle ID
For any additional methods, see http://docs.mparticle.com/developers/sdk/javascript/apidocs/classes/mParticle.Identity.getCurrentUser().html
*/

function UserAttributeHandler(common) {
  this.common = common || {};
}
UserAttributeHandler.prototype.onRemoveUserAttribute = function(
  key,
  mParticleUser
) {};
UserAttributeHandler.prototype.onSetUserAttribute = function(
  key,
  value,
  mParticleUser
) {};
UserAttributeHandler.prototype.onConsentStateUpdated = function(
  oldState,
  newState,
  mParticleUser
) {};

var userAttributeHandler = UserAttributeHandler;

// =============== REACH OUT TO MPARTICLE IF YOU HAVE ANY QUESTIONS ===============
//
//  Copyright 2018 mParticle, Inc.
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.









var name = initialization_1.name,
    moduleId = initialization_1.moduleId,
    MessageType = {
        SessionStart: 1,
        SessionEnd: 2,
        PageView: 3,
        PageEvent: 4,
        CrashReport: 5,
        OptOut: 6,
        Commerce: 16,
        Media: 20,
    };

var constructor = function() {
    var self = this,
        isInitialized = false,
        forwarderSettings,
        reportingService,
        eventQueue = [];

    self.name = initialization_1.name;
    self.moduleId = initialization_1.moduleId;
    self.common = new common();

    function initForwarder(
        settings,
        service,
        testMode,
        trackerId,
        userAttributes,
        userIdentities,
        appVersion,
        appName,
        customFlags,
        clientId
    ) {
        forwarderSettings = settings;

        if (
            typeof window !== 'undefined' &&
            window.mParticle.isTestEnvironment
        ) {
            reportingService = function() {};
        } else {
            reportingService = service;
        }

        try {
            initialization_1.initForwarder(
                settings,
                testMode,
                userAttributes,
                userIdentities,
                processEvent,
                eventQueue,
                isInitialized,
                self.common,
                appVersion,
                appName,
                customFlags,
                clientId
            );
            self.eventHandler = new eventHandler(self.common);
            self.identityHandler = new identityHandler(self.common);
            self.userAttributeHandler = new userAttributeHandler(self.common);
            self.commerceHandler = new commerceHandler(self.common);

            isInitialized = true;
        } catch (e) {
            console.log('Failed to initialize ' + name + ' - ' + e);
        }
    }

    function processEvent(event) {
        var reportEvent = false;
        if (isInitialized) {
            try {
                if (event.EventDataType === MessageType.SessionStart) {
                    reportEvent = logSessionStart(event);
                } else if (event.EventDataType === MessageType.SessionEnd) {
                    reportEvent = logSessionEnd(event);
                } else if (event.EventDataType === MessageType.CrashReport) {
                    reportEvent = logError(event);
                } else if (event.EventDataType === MessageType.PageView) {
                    reportEvent = logPageView(event);
                } else if (event.EventDataType === MessageType.Commerce) {
                    reportEvent = logEcommerceEvent(event);
                } else if (event.EventDataType === MessageType.PageEvent) {
                    reportEvent = logEvent(event);
                } else if (event.EventDataType === MessageType.Media) {
                    // Kits should just treat Media Events as generic Events
                    reportEvent = logEvent(event);
                }
                if (reportEvent === true && reportingService) {
                    reportingService(self, event);
                    return 'Successfully sent to ' + name;
                } else {
                    return (
                        'Error logging event or event type not supported on forwarder ' +
                        name
                    );
                }
            } catch (e) {
                return 'Failed to send to ' + name + ' ' + e;
            }
        } else {
            eventQueue.push(event);
            return (
                "Can't send to forwarder " +
                name +
                ', not initialized. Event added to queue.'
            );
        }
    }

    function logSessionStart(event) {
        try {
            sessionHandler_1.onSessionStart(event);
            return true;
        } catch (e) {
            return {
                error: 'Error starting session on forwarder ' + name + '; ' + e,
            };
        }
    }

    function logSessionEnd(event) {
        try {
            sessionHandler_1.onSessionEnd(event);
            return true;
        } catch (e) {
            return {
                error: 'Error ending session on forwarder ' + name + '; ' + e,
            };
        }
    }

    function logError(event) {
        try {
            self.eventHandler.logError(event);
            return true;
        } catch (e) {
            return {
                error: 'Error logging error on forwarder ' + name + '; ' + e,
            };
        }
    }

    function logPageView(event) {
        try {
            self.eventHandler.logPageView(event);
            return true;
        } catch (e) {
            return {
                error:
                    'Error logging page view on forwarder ' + name + '; ' + e,
            };
        }
    }

    function logEvent(event) {
        try {
            self.eventHandler.logEvent(event);
            return true;
        } catch (e) {
            return {
                error: 'Error logging event on forwarder ' + name + '; ' + e,
            };
        }
    }

    function logEcommerceEvent(event) {
        try {
            self.commerceHandler.logCommerceEvent(event);
            return true;
        } catch (e) {
            return {
                error:
                    'Error logging purchase event on forwarder ' +
                    name +
                    '; ' +
                    e,
            };
        }
    }

    function setUserAttribute(key, value) {
        if (isInitialized) {
            try {
                self.userAttributeHandler.onSetUserAttribute(
                    key,
                    value,
                    forwarderSettings
                );
                return 'Successfully set user attribute on forwarder ' + name;
            } catch (e) {
                return (
                    'Error setting user attribute on forwarder ' +
                    name +
                    '; ' +
                    e
                );
            }
        } else {
            return (
                "Can't set user attribute on forwarder " +
                name +
                ', not initialized'
            );
        }
    }

    function removeUserAttribute(key) {
        if (isInitialized) {
            try {
                self.userAttributeHandler.onRemoveUserAttribute(
                    key,
                    forwarderSettings
                );
                return (
                    'Successfully removed user attribute on forwarder ' + name
                );
            } catch (e) {
                return (
                    'Error removing user attribute on forwarder ' +
                    name +
                    '; ' +
                    e
                );
            }
        } else {
            return (
                "Can't remove user attribute on forwarder " +
                name +
                ', not initialized'
            );
        }
    }

    function setUserIdentity(id, type) {
        if (isInitialized) {
            try {
                self.identityHandler.onSetUserIdentity(
                    forwarderSettings,
                    id,
                    type
                );
                return 'Successfully set user Identity on forwarder ' + name;
            } catch (e) {
                return (
                    'Error removing user attribute on forwarder ' +
                    name +
                    '; ' +
                    e
                );
            }
        } else {
            return (
                "Can't call setUserIdentity on forwarder " +
                name +
                ', not initialized'
            );
        }
    }

    function onUserIdentified(user) {
        if (isInitialized) {
            try {
                self.identityHandler.onUserIdentified(user);

                return (
                    'Successfully called onUserIdentified on forwarder ' + name
                );
            } catch (e) {
                return {
                    error:
                        'Error calling onUserIdentified on forwarder ' +
                        name +
                        '; ' +
                        e,
                };
            }
        } else {
            return (
                "Can't set new user identities on forwader  " +
                name +
                ', not initialized'
            );
        }
    }

    function onIdentifyComplete(user, filteredIdentityRequest) {
        if (isInitialized) {
            try {
                self.identityHandler.onIdentifyComplete(
                    user,
                    filteredIdentityRequest
                );

                return (
                    'Successfully called onIdentifyComplete on forwarder ' +
                    name
                );
            } catch (e) {
                return {
                    error:
                        'Error calling onIdentifyComplete on forwarder ' +
                        name +
                        '; ' +
                        e,
                };
            }
        } else {
            return (
                "Can't call onIdentifyCompleted on forwader  " +
                name +
                ', not initialized'
            );
        }
    }

    function onLoginComplete(user, filteredIdentityRequest) {
        if (isInitialized) {
            try {
                self.identityHandler.onLoginComplete(
                    user,
                    filteredIdentityRequest
                );

                return (
                    'Successfully called onLoginComplete on forwarder ' + name
                );
            } catch (e) {
                return {
                    error:
                        'Error calling onLoginComplete on forwarder ' +
                        name +
                        '; ' +
                        e,
                };
            }
        } else {
            return (
                "Can't call onLoginComplete on forwader  " +
                name +
                ', not initialized'
            );
        }
    }

    function onLogoutComplete(user, filteredIdentityRequest) {
        if (isInitialized) {
            try {
                self.identityHandler.onLogoutComplete(
                    user,
                    filteredIdentityRequest
                );

                return (
                    'Successfully called onLogoutComplete on forwarder ' + name
                );
            } catch (e) {
                return {
                    error:
                        'Error calling onLogoutComplete on forwarder ' +
                        name +
                        '; ' +
                        e,
                };
            }
        } else {
            return (
                "Can't call onLogoutComplete on forwader  " +
                name +
                ', not initialized'
            );
        }
    }

    function onModifyComplete(user, filteredIdentityRequest) {
        if (isInitialized) {
            try {
                self.identityHandler.onModifyComplete(
                    user,
                    filteredIdentityRequest
                );

                return (
                    'Successfully called onModifyComplete on forwarder ' + name
                );
            } catch (e) {
                return {
                    error:
                        'Error calling onModifyComplete on forwarder ' +
                        name +
                        '; ' +
                        e,
                };
            }
        } else {
            return (
                "Can't call onModifyComplete on forwader  " +
                name +
                ', not initialized'
            );
        }
    }

    function setOptOut(isOptingOutBoolean) {
        if (isInitialized) {
            try {
                self.initialization.setOptOut(isOptingOutBoolean);

                return 'Successfully called setOptOut on forwarder ' + name;
            } catch (e) {
                return {
                    error:
                        'Error calling setOptOut on forwarder ' +
                        name +
                        '; ' +
                        e,
                };
            }
        } else {
            return (
                "Can't call setOptOut on forwader  " +
                name +
                ', not initialized'
            );
        }
    }

    this.init = initForwarder;
    this.process = processEvent;
    this.setUserAttribute = setUserAttribute;
    this.removeUserAttribute = removeUserAttribute;
    this.onUserIdentified = onUserIdentified;
    this.setUserIdentity = setUserIdentity;
    this.onIdentifyComplete = onIdentifyComplete;
    this.onLoginComplete = onLoginComplete;
    this.onLogoutComplete = onLogoutComplete;
    this.onModifyComplete = onModifyComplete;
    this.setOptOut = setOptOut;
};

function getId() {
    return moduleId;
}

function isObject(val) {
    return (
        val != null && typeof val === 'object' && Array.isArray(val) === false
    );
}

function register(config) {
    if (!config) {
        console.log(
            'You must pass a config object to register the kit ' + name
        );
        return;
    }

    if (!isObject(config)) {
        console.log(
            "'config' must be an object. You passed in a " + typeof config
        );
        return;
    }

    if (isObject(config.kits)) {
        config.kits[name] = {
            constructor: constructor,
        };
    } else {
        config.kits = {};
        config.kits[name] = {
            constructor: constructor,
        };
    }
    console.log(
        'Successfully registered ' + name + ' to your mParticle configuration'
    );
}

if (typeof window !== 'undefined') {
    if (window && window.mParticle && window.mParticle.addForwarder) {
        window.mParticle.addForwarder({
            name: name,
            constructor: constructor,
            getId: getId,
        });
    }
}

var webKitWrapper = {
    register: register,
};
var webKitWrapper_1 = webKitWrapper.register;

exports.default = webKitWrapper;
exports.register = webKitWrapper_1;

},{}],2:[function(require,module,exports){
// =============== REACH OUT TO MPARTICLE IF YOU HAVE ANY QUESTIONS ===============
//
//  Copyright 2018 mParticle, Inc.
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.

var Common = require('../../../src/common');
var CommerceHandler = require('../../../src/commerce-handler');
var EventHandler = require('../../../src/event-handler');
var IdentityHandler = require('../../../src/identity-handler');
var Initialization = require('../../../src/initialization');
var SessionHandler = require('../../../src/session-handler');
var UserAttributeHandler = require('../../../src/user-attribute-handler');

var name = Initialization.name,
    moduleId = Initialization.moduleId,
    MessageType = {
        SessionStart: 1,
        SessionEnd: 2,
        PageView: 3,
        PageEvent: 4,
        CrashReport: 5,
        OptOut: 6,
        Commerce: 16,
        Media: 20,
    };

var constructor = function() {
    var self = this,
        isInitialized = false,
        forwarderSettings,
        reportingService,
        eventQueue = [];

    self.name = Initialization.name;
    self.moduleId = Initialization.moduleId;
    self.common = new Common();

    function initForwarder(
        settings,
        service,
        testMode,
        trackerId,
        userAttributes,
        userIdentities,
        appVersion,
        appName,
        customFlags,
        clientId
    ) {
        forwarderSettings = settings;

        if (
            typeof window !== 'undefined' &&
            window.mParticle.isTestEnvironment
        ) {
            reportingService = function() {};
        } else {
            reportingService = service;
        }

        try {
            Initialization.initForwarder(
                settings,
                testMode,
                userAttributes,
                userIdentities,
                processEvent,
                eventQueue,
                isInitialized,
                self.common,
                appVersion,
                appName,
                customFlags,
                clientId
            );
            self.eventHandler = new EventHandler(self.common);
            self.identityHandler = new IdentityHandler(self.common);
            self.userAttributeHandler = new UserAttributeHandler(self.common);
            self.commerceHandler = new CommerceHandler(self.common);

            isInitialized = true;
        } catch (e) {
            console.log('Failed to initialize ' + name + ' - ' + e);
        }
    }

    function processEvent(event) {
        var reportEvent = false;
        if (isInitialized) {
            try {
                if (event.EventDataType === MessageType.SessionStart) {
                    reportEvent = logSessionStart(event);
                } else if (event.EventDataType === MessageType.SessionEnd) {
                    reportEvent = logSessionEnd(event);
                } else if (event.EventDataType === MessageType.CrashReport) {
                    reportEvent = logError(event);
                } else if (event.EventDataType === MessageType.PageView) {
                    reportEvent = logPageView(event);
                } else if (event.EventDataType === MessageType.Commerce) {
                    reportEvent = logEcommerceEvent(event);
                } else if (event.EventDataType === MessageType.PageEvent) {
                    reportEvent = logEvent(event);
                } else if (event.EventDataType === MessageType.Media) {
                    // Kits should just treat Media Events as generic Events
                    reportEvent = logEvent(event);
                }
                if (reportEvent === true && reportingService) {
                    reportingService(self, event);
                    return 'Successfully sent to ' + name;
                } else {
                    return (
                        'Error logging event or event type not supported on forwarder ' +
                        name
                    );
                }
            } catch (e) {
                return 'Failed to send to ' + name + ' ' + e;
            }
        } else {
            eventQueue.push(event);
            return (
                "Can't send to forwarder " +
                name +
                ', not initialized. Event added to queue.'
            );
        }
    }

    function logSessionStart(event) {
        try {
            SessionHandler.onSessionStart(event);
            return true;
        } catch (e) {
            return {
                error: 'Error starting session on forwarder ' + name + '; ' + e,
            };
        }
    }

    function logSessionEnd(event) {
        try {
            SessionHandler.onSessionEnd(event);
            return true;
        } catch (e) {
            return {
                error: 'Error ending session on forwarder ' + name + '; ' + e,
            };
        }
    }

    function logError(event) {
        try {
            self.eventHandler.logError(event);
            return true;
        } catch (e) {
            return {
                error: 'Error logging error on forwarder ' + name + '; ' + e,
            };
        }
    }

    function logPageView(event) {
        try {
            self.eventHandler.logPageView(event);
            return true;
        } catch (e) {
            return {
                error:
                    'Error logging page view on forwarder ' + name + '; ' + e,
            };
        }
    }

    function logEvent(event) {
        try {
            self.eventHandler.logEvent(event);
            return true;
        } catch (e) {
            return {
                error: 'Error logging event on forwarder ' + name + '; ' + e,
            };
        }
    }

    function logEcommerceEvent(event) {
        try {
            self.commerceHandler.logCommerceEvent(event);
            return true;
        } catch (e) {
            return {
                error:
                    'Error logging purchase event on forwarder ' +
                    name +
                    '; ' +
                    e,
            };
        }
    }

    function setUserAttribute(key, value) {
        if (isInitialized) {
            try {
                self.userAttributeHandler.onSetUserAttribute(
                    key,
                    value,
                    forwarderSettings
                );
                return 'Successfully set user attribute on forwarder ' + name;
            } catch (e) {
                return (
                    'Error setting user attribute on forwarder ' +
                    name +
                    '; ' +
                    e
                );
            }
        } else {
            return (
                "Can't set user attribute on forwarder " +
                name +
                ', not initialized'
            );
        }
    }

    function removeUserAttribute(key) {
        if (isInitialized) {
            try {
                self.userAttributeHandler.onRemoveUserAttribute(
                    key,
                    forwarderSettings
                );
                return (
                    'Successfully removed user attribute on forwarder ' + name
                );
            } catch (e) {
                return (
                    'Error removing user attribute on forwarder ' +
                    name +
                    '; ' +
                    e
                );
            }
        } else {
            return (
                "Can't remove user attribute on forwarder " +
                name +
                ', not initialized'
            );
        }
    }

    function setUserIdentity(id, type) {
        if (isInitialized) {
            try {
                self.identityHandler.onSetUserIdentity(
                    forwarderSettings,
                    id,
                    type
                );
                return 'Successfully set user Identity on forwarder ' + name;
            } catch (e) {
                return (
                    'Error removing user attribute on forwarder ' +
                    name +
                    '; ' +
                    e
                );
            }
        } else {
            return (
                "Can't call setUserIdentity on forwarder " +
                name +
                ', not initialized'
            );
        }
    }

    function onUserIdentified(user) {
        if (isInitialized) {
            try {
                self.identityHandler.onUserIdentified(user);

                return (
                    'Successfully called onUserIdentified on forwarder ' + name
                );
            } catch (e) {
                return {
                    error:
                        'Error calling onUserIdentified on forwarder ' +
                        name +
                        '; ' +
                        e,
                };
            }
        } else {
            return (
                "Can't set new user identities on forwader  " +
                name +
                ', not initialized'
            );
        }
    }

    function onIdentifyComplete(user, filteredIdentityRequest) {
        if (isInitialized) {
            try {
                self.identityHandler.onIdentifyComplete(
                    user,
                    filteredIdentityRequest
                );

                return (
                    'Successfully called onIdentifyComplete on forwarder ' +
                    name
                );
            } catch (e) {
                return {
                    error:
                        'Error calling onIdentifyComplete on forwarder ' +
                        name +
                        '; ' +
                        e,
                };
            }
        } else {
            return (
                "Can't call onIdentifyCompleted on forwader  " +
                name +
                ', not initialized'
            );
        }
    }

    function onLoginComplete(user, filteredIdentityRequest) {
        if (isInitialized) {
            try {
                self.identityHandler.onLoginComplete(
                    user,
                    filteredIdentityRequest
                );

                return (
                    'Successfully called onLoginComplete on forwarder ' + name
                );
            } catch (e) {
                return {
                    error:
                        'Error calling onLoginComplete on forwarder ' +
                        name +
                        '; ' +
                        e,
                };
            }
        } else {
            return (
                "Can't call onLoginComplete on forwader  " +
                name +
                ', not initialized'
            );
        }
    }

    function onLogoutComplete(user, filteredIdentityRequest) {
        if (isInitialized) {
            try {
                self.identityHandler.onLogoutComplete(
                    user,
                    filteredIdentityRequest
                );

                return (
                    'Successfully called onLogoutComplete on forwarder ' + name
                );
            } catch (e) {
                return {
                    error:
                        'Error calling onLogoutComplete on forwarder ' +
                        name +
                        '; ' +
                        e,
                };
            }
        } else {
            return (
                "Can't call onLogoutComplete on forwader  " +
                name +
                ', not initialized'
            );
        }
    }

    function onModifyComplete(user, filteredIdentityRequest) {
        if (isInitialized) {
            try {
                self.identityHandler.onModifyComplete(
                    user,
                    filteredIdentityRequest
                );

                return (
                    'Successfully called onModifyComplete on forwarder ' + name
                );
            } catch (e) {
                return {
                    error:
                        'Error calling onModifyComplete on forwarder ' +
                        name +
                        '; ' +
                        e,
                };
            }
        } else {
            return (
                "Can't call onModifyComplete on forwader  " +
                name +
                ', not initialized'
            );
        }
    }

    function setOptOut(isOptingOutBoolean) {
        if (isInitialized) {
            try {
                self.initialization.setOptOut(isOptingOutBoolean);

                return 'Successfully called setOptOut on forwarder ' + name;
            } catch (e) {
                return {
                    error:
                        'Error calling setOptOut on forwarder ' +
                        name +
                        '; ' +
                        e,
                };
            }
        } else {
            return (
                "Can't call setOptOut on forwader  " +
                name +
                ', not initialized'
            );
        }
    }

    this.init = initForwarder;
    this.process = processEvent;
    this.setUserAttribute = setUserAttribute;
    this.removeUserAttribute = removeUserAttribute;
    this.onUserIdentified = onUserIdentified;
    this.setUserIdentity = setUserIdentity;
    this.onIdentifyComplete = onIdentifyComplete;
    this.onLoginComplete = onLoginComplete;
    this.onLogoutComplete = onLogoutComplete;
    this.onModifyComplete = onModifyComplete;
    this.setOptOut = setOptOut;
};

function getId() {
    return moduleId;
}

function isObject(val) {
    return (
        val != null && typeof val === 'object' && Array.isArray(val) === false
    );
}

function register(config) {
    if (!config) {
        console.log(
            'You must pass a config object to register the kit ' + name
        );
        return;
    }

    if (!isObject(config)) {
        console.log(
            "'config' must be an object. You passed in a " + typeof config
        );
        return;
    }

    if (isObject(config.kits)) {
        config.kits[name] = {
            constructor: constructor,
        };
    } else {
        config.kits = {};
        config.kits[name] = {
            constructor: constructor,
        };
    }
    console.log(
        'Successfully registered ' + name + ' to your mParticle configuration'
    );
}

if (typeof window !== 'undefined') {
    if (window && window.mParticle && window.mParticle.addForwarder) {
        window.mParticle.addForwarder({
            name: name,
            constructor: constructor,
            getId: getId,
        });
    }
}

module.exports = {
    register: register,
};

},{"../../../src/commerce-handler":13,"../../../src/common":14,"../../../src/event-handler":15,"../../../src/identity-handler":16,"../../../src/initialization":17,"../../../src/session-handler":18,"../../../src/user-attribute-handler":19}],3:[function(require,module,exports){
(function (global){(function (){
if (typeof globalThis !== 'undefined') {globalThis.regeneratorRuntime = undefined}

// Base64 encoder/decoder - http://www.webtoolkit.info/javascript_base64.html
var Base64$2={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",// Input must be a string
encode:function(a){try{if(window.btoa&&window.atob)return window.btoa(unescape(encodeURIComponent(a)))}catch(a){console.error("Error encoding cookie values into Base64:"+a);}return this._encode(a)},_encode:function(a){var b,c,d,e,f,g,h,j="",k=0;for(a=UTF8.encode(a);k<a.length;)b=a.charCodeAt(k++),c=a.charCodeAt(k++),d=a.charCodeAt(k++),e=b>>2,f=(3&b)<<4|c>>4,g=(15&c)<<2|d>>6,h=63&d,isNaN(c)?g=h=64:isNaN(d)&&(h=64),j=j+Base64$2._keyStr.charAt(e)+Base64$2._keyStr.charAt(f)+Base64$2._keyStr.charAt(g)+Base64$2._keyStr.charAt(h);return j},decode:function(a){try{if(window.btoa&&window.atob)return decodeURIComponent(escape(window.atob(a)))}catch(a){//log(e);
}return Base64$2._decode(a)},_decode:function(a){var b,c,d,e,f,g,h,j="",k=0;for(a=a.replace(/[^A-Za-z0-9\+\/\=]/g,"");k<a.length;)e=Base64$2._keyStr.indexOf(a.charAt(k++)),f=Base64$2._keyStr.indexOf(a.charAt(k++)),g=Base64$2._keyStr.indexOf(a.charAt(k++)),h=Base64$2._keyStr.indexOf(a.charAt(k++)),b=e<<2|f>>4,c=(15&f)<<4|g>>2,d=(3&g)<<6|h,j+=String.fromCharCode(b),64!==g&&(j+=String.fromCharCode(c)),64!==h&&(j+=String.fromCharCode(d));return j=UTF8.decode(j),j}},UTF8={encode:function(a){for(var b,d="",e=0;e<a.length;e++)b=a.charCodeAt(e),128>b?d+=String.fromCharCode(b):127<b&&2048>b?(d+=String.fromCharCode(192|b>>6),d+=String.fromCharCode(128|63&b)):(d+=String.fromCharCode(224|b>>12),d+=String.fromCharCode(128|63&b>>6),d+=String.fromCharCode(128|63&b));return d},decode:function(a){for(var b="",d=0,e=0,f=0,g=0;d<a.length;)e=a.charCodeAt(d),128>e?(b+=String.fromCharCode(e),d++):191<e&&224>e?(f=a.charCodeAt(d+1),b+=String.fromCharCode((31&e)<<6|63&f),d+=2):(f=a.charCodeAt(d+1),g=a.charCodeAt(d+2),b+=String.fromCharCode((15&e)<<12|(63&f)<<6|63&g),d+=3);return b}};var Polyfill = {// forEach polyfill
// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
forEach:function forEach(a,b){var c,d;if(null==this)throw new TypeError(" this is null or not defined");var e=Object(this),f=e.length>>>0;if("function"!=typeof a)throw new TypeError(a+" is not a function");for(1<arguments.length&&(c=b),d=0;d<f;){var g;d in e&&(g=e[d],a.call(c,g,d,e)),d++;}},// map polyfill
// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.io/#x15.4.4.19
map:function map(a,b){var c,d,e;if(null===this)throw new TypeError(" this is null or not defined");var f=Object(this),g=f.length>>>0;if("function"!=typeof a)throw new TypeError(a+" is not a function");for(1<arguments.length&&(c=b),d=Array(g),e=0;e<g;){var h,i;e in f&&(h=f[e],i=a.call(c,h,e,f),d[e]=i),e++;}return d},// filter polyfill
// Prodcution steps of ECMA-262, Edition 5
// Reference: http://es5.github.io/#x15.4.4.20
filter:function filter(a/*, thisArg*/){if(void 0===this||null===this)throw new TypeError;var b=Object(this),c=b.length>>>0;if("function"!=typeof a)throw new TypeError;for(var d=[],e=2<=arguments.length?arguments[1]:void 0,f=0;f<c;f++)if(f in b){var g=b[f];a.call(e,g,f,b)&&d.push(g);}return d},// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
isArray:function isArray(a){return "[object Array]"===Object.prototype.toString.call(a)},Base64:Base64$2};

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

var _TriggerUploadType,MessageType$1={SessionStart:1,SessionEnd:2,PageView:3,PageEvent:4,CrashReport:5,OptOut:6,AppStateTransition:10,Profile:14,Commerce:16,Media:20,UserAttributeChange:17,UserIdentityChange:18},TriggerUploadType=(_TriggerUploadType={},_defineProperty(_TriggerUploadType,MessageType$1.Commerce,1),_defineProperty(_TriggerUploadType,MessageType$1.UserAttributeChange,1),_defineProperty(_TriggerUploadType,MessageType$1.UserIdentityChange,1),_TriggerUploadType),EventType={Unknown:0,Navigation:1,Location:2,Search:3,Transaction:4,UserContent:5,UserPreference:6,Social:7,Other:8,Media:9,getName:function getName(a){return a===EventType.Unknown?"Unknown":a===EventType.Navigation?"Navigation":a===EventType.Location?"Location":a===EventType.Search?"Search":a===EventType.Transaction?"Transaction":a===EventType.UserContent?"User Content":a===EventType.UserPreference?"User Preference":a===EventType.Social?"Social":a===CommerceEventType.ProductAddToCart?"Product Added to Cart":a===CommerceEventType.ProductAddToWishlist?"Product Added to Wishlist":a===CommerceEventType.ProductCheckout?"Product Checkout":a===CommerceEventType.ProductCheckoutOption?"Product Checkout Options":a===CommerceEventType.ProductClick?"Product Click":a===CommerceEventType.ProductImpression?"Product Impression":a===CommerceEventType.ProductPurchase?"Product Purchased":a===CommerceEventType.ProductRefund?"Product Refunded":a===CommerceEventType.ProductRemoveFromCart?"Product Removed From Cart":a===CommerceEventType.ProductRemoveFromWishlist?"Product Removed from Wishlist":a===CommerceEventType.ProductViewDetail?"Product View Details":a===CommerceEventType.PromotionClick?"Promotion Click":a===CommerceEventType.PromotionView?"Promotion View":"Other"}},CommerceEventType={ProductAddToCart:10,ProductRemoveFromCart:11,ProductCheckout:12,ProductCheckoutOption:13,ProductClick:14,ProductViewDetail:15,ProductPurchase:16,ProductRefund:17,PromotionView:18,PromotionClick:19,ProductAddToWishlist:20,ProductRemoveFromWishlist:21,ProductImpression:22},IdentityType={Other:0,CustomerId:1,Facebook:2,Twitter:3,Google:4,Microsoft:5,Yahoo:6,Email:7,FacebookCustomAudienceId:9,Other2:10,Other3:11,Other4:12,Other5:13,Other6:14,Other7:15,Other8:16,Other9:17,Other10:18,MobileNumber:19,PhoneNumber2:20,PhoneNumber3:21};IdentityType.isValid=function(a){if("number"==typeof a)for(var b in IdentityType)if(IdentityType.hasOwnProperty(b)&&IdentityType[b]===a)return !0;return !1},IdentityType.getName=function(a){return a===window.mParticle.IdentityType.CustomerId?"Customer ID":a===window.mParticle.IdentityType.Facebook?"Facebook ID":a===window.mParticle.IdentityType.Twitter?"Twitter ID":a===window.mParticle.IdentityType.Google?"Google ID":a===window.mParticle.IdentityType.Microsoft?"Microsoft ID":a===window.mParticle.IdentityType.Yahoo?"Yahoo ID":a===window.mParticle.IdentityType.Email?"Email":a===window.mParticle.IdentityType.FacebookCustomAudienceId?"Facebook App User ID":"Other ID"},IdentityType.getIdentityType=function(a){return "other"===a?IdentityType.Other:"customerid"===a?IdentityType.CustomerId:"facebook"===a?IdentityType.Facebook:"twitter"===a?IdentityType.Twitter:"google"===a?IdentityType.Google:"microsoft"===a?IdentityType.Microsoft:"yahoo"===a?IdentityType.Yahoo:"email"===a?IdentityType.Email:"facebookcustomaudienceid"===a?IdentityType.FacebookCustomAudienceId:"other2"===a?IdentityType.Other2:"other3"===a?IdentityType.Other3:"other4"===a?IdentityType.Other4:"other5"===a?IdentityType.Other5:"other6"===a?IdentityType.Other6:"other7"===a?IdentityType.Other7:"other8"===a?IdentityType.Other8:"other9"===a?IdentityType.Other9:"other10"===a?IdentityType.Other10:"mobile_number"===a?IdentityType.MobileNumber:"phone_number_2"===a?IdentityType.PhoneNumber2:!("phone_number_3"!=a)&&IdentityType.PhoneNumber3},IdentityType.getIdentityName=function(a){return a===IdentityType.Other?"other":a===IdentityType.CustomerId?"customerid":a===IdentityType.Facebook?"facebook":a===IdentityType.Twitter?"twitter":a===IdentityType.Google?"google":a===IdentityType.Microsoft?"microsoft":a===IdentityType.Yahoo?"yahoo":a===IdentityType.Email?"email":a===IdentityType.FacebookCustomAudienceId?"facebookcustomaudienceid":a===IdentityType.Other2?"other2":a===IdentityType.Other3?"other3":a===IdentityType.Other4?"other4":a===IdentityType.Other5?"other5":a===IdentityType.Other6?"other6":a===IdentityType.Other7?"other7":a===IdentityType.Other8?"other8":a===IdentityType.Other9?"other9":a===IdentityType.Other10?"other10":a===IdentityType.MobileNumber?"mobile_number":a===IdentityType.PhoneNumber2?"phone_number_2":a===IdentityType.PhoneNumber3?"phone_number_3":void 0};var ProductActionType={Unknown:0,AddToCart:1,RemoveFromCart:2,Checkout:3,CheckoutOption:4,Click:5,ViewDetail:6,Purchase:7,Refund:8,AddToWishlist:9,RemoveFromWishlist:10};ProductActionType.getName=function(a){return a===ProductActionType.AddToCart?"Add to Cart":a===ProductActionType.RemoveFromCart?"Remove from Cart":a===ProductActionType.Checkout?"Checkout":a===ProductActionType.CheckoutOption?"Checkout Option":a===ProductActionType.Click?"Click":a===ProductActionType.ViewDetail?"View Detail":a===ProductActionType.Purchase?"Purchase":a===ProductActionType.Refund?"Refund":a===ProductActionType.AddToWishlist?"Add to Wishlist":a===ProductActionType.RemoveFromWishlist?"Remove from Wishlist":"Unknown"},ProductActionType.getExpansionName=function(a){return a===ProductActionType.AddToCart?"add_to_cart":a===ProductActionType.RemoveFromCart?"remove_from_cart":a===ProductActionType.Checkout?"checkout":a===ProductActionType.CheckoutOption?"checkout_option":a===ProductActionType.Click?"click":a===ProductActionType.ViewDetail?"view_detail":a===ProductActionType.Purchase?"purchase":a===ProductActionType.Refund?"refund":a===ProductActionType.AddToWishlist?"add_to_wishlist":a===ProductActionType.RemoveFromWishlist?"remove_from_wishlist":"unknown"};var PromotionActionType={Unknown:0,PromotionView:1,PromotionClick:2};PromotionActionType.getName=function(a){return a===PromotionActionType.PromotionView?"view":a===PromotionActionType.PromotionClick?"click":"unknown"},PromotionActionType.getExpansionName=function(a){return a===PromotionActionType.PromotionView?"view":a===PromotionActionType.PromotionClick?"click":"unknown"};var ProfileMessageType={Logout:3},ApplicationTransitionType$1={AppInit:1};var Types = {MessageType:MessageType$1,EventType:EventType,CommerceEventType:CommerceEventType,IdentityType:IdentityType,ProfileMessageType:ProfileMessageType,ApplicationTransitionType:ApplicationTransitionType$1,ProductActionType:ProductActionType,PromotionActionType:PromotionActionType,TriggerUploadType:TriggerUploadType};

var version = "2.17.2";

var Constants={sdkVersion:version,sdkVendor:"mparticle",platform:"web",Messages:{ErrorMessages:{NoToken:"A token must be specified.",EventNameInvalidType:"Event name must be a valid string value.",EventDataInvalidType:"Event data must be a valid object hash.",LoggingDisabled:"Event logging is currently disabled.",CookieParseError:"Could not parse cookie",EventEmpty:"Event object is null or undefined, cancelling send",APIRequestEmpty:"APIRequest is null or undefined, cancelling send",NoEventType:"Event type must be specified.",TransactionIdRequired:"Transaction ID is required",TransactionRequired:"A transaction attributes object is required",PromotionIdRequired:"Promotion ID is required",BadAttribute:"Attribute value cannot be object or array",BadKey:"Key value cannot be object or array",BadLogPurchase:"Transaction attributes and a product are both required to log a purchase, https://docs.mparticle.com/?javascript#measuring-transactions"},InformationMessages:{CookieSearch:"Searching for cookie",CookieFound:"Cookie found, parsing values",CookieNotFound:"Cookies not found",CookieSet:"Setting cookie",CookieSync:"Performing cookie sync",SendBegin:"Starting to send event",SendIdentityBegin:"Starting to send event to identity server",SendWindowsPhone:"Sending event to Windows Phone container",SendIOS:"Calling iOS path: ",SendAndroid:"Calling Android JS interface method: ",SendHttp:"Sending event to mParticle HTTP service",SendAliasHttp:"Sending alias request to mParticle HTTP service",SendIdentityHttp:"Sending event to mParticle HTTP service",StartingNewSession:"Starting new Session",StartingLogEvent:"Starting to log event",StartingLogOptOut:"Starting to log user opt in/out",StartingEndSession:"Starting to end session",StartingInitialization:"Starting to initialize",StartingLogCommerceEvent:"Starting to log commerce event",StartingAliasRequest:"Starting to Alias MPIDs",LoadingConfig:"Loading configuration options",AbandonLogEvent:"Cannot log event, logging disabled or developer token not set",AbandonAliasUsers:"Cannot Alias Users, logging disabled or developer token not set",AbandonStartSession:"Cannot start session, logging disabled or developer token not set",AbandonEndSession:"Cannot end session, logging disabled or developer token not set",NoSessionToEnd:"Cannot end session, no active session found"},ValidationMessages:{ModifyIdentityRequestUserIdentitiesPresent:"identityRequests to modify require userIdentities to be present. Request not sent to server. Please fix and try again",IdentityRequesetInvalidKey:"There is an invalid key on your identityRequest object. It can only contain a `userIdentities` object and a `onUserAlias` function. Request not sent to server. Please fix and try again.",OnUserAliasType:"The onUserAlias value must be a function.",UserIdentities:"The userIdentities key must be an object with keys of identityTypes and values of strings. Request not sent to server. Please fix and try again.",UserIdentitiesInvalidKey:"There is an invalid identity key on your `userIdentities` object within the identityRequest. Request not sent to server. Please fix and try again.",UserIdentitiesInvalidValues:"All user identity values must be strings or null. Request not sent to server. Please fix and try again.",AliasMissingMpid:"Alias Request must contain both a destinationMpid and a sourceMpid",AliasNonUniqueMpid:"Alias Request's destinationMpid and sourceMpid must be unique",AliasMissingTime:"Alias Request must have both a startTime and an endTime",AliasStartBeforeEndTime:"Alias Request's endTime must be later than its startTime"}},NativeSdkPaths:{LogEvent:"logEvent",SetUserTag:"setUserTag",RemoveUserTag:"removeUserTag",SetUserAttribute:"setUserAttribute",RemoveUserAttribute:"removeUserAttribute",SetSessionAttribute:"setSessionAttribute",AddToCart:"addToCart",RemoveFromCart:"removeFromCart",ClearCart:"clearCart",LogOut:"logOut",SetUserAttributeList:"setUserAttributeList",RemoveAllUserAttributes:"removeAllUserAttributes",GetUserAttributesLists:"getUserAttributesLists",GetAllUserAttributes:"getAllUserAttributes",Identify:"identify",Logout:"logout",Login:"login",Modify:"modify",Alias:"aliasUsers",Upload:"upload"},StorageNames:{localStorageName:"mprtcl-api",localStorageNameV3:"mprtcl-v3",cookieName:"mprtcl-api",cookieNameV2:"mprtcl-v2",cookieNameV3:"mprtcl-v3",localStorageNameV4:"mprtcl-v4",localStorageProductsV4:"mprtcl-prodv4",cookieNameV4:"mprtcl-v4",currentStorageName:"mprtcl-v4",currentStorageProductsName:"mprtcl-prodv4"},DefaultConfig:{cookieDomain:null,cookieExpiration:365,logLevel:null,timeout:300,sessionTimeout:30,maxProducts:20,forwarderStatsTimeout:5e3,integrationDelayTimeout:5e3,maxCookieSize:3e3,aliasMaxWindow:90,uploadInterval:0// Maximum milliseconds in between batch uploads, below 500 will mean immediate upload
},DefaultUrls:{v1SecureServiceUrl:"jssdks.mparticle.com/v1/JS/",v2SecureServiceUrl:"jssdks.mparticle.com/v2/JS/",v3SecureServiceUrl:"jssdks.mparticle.com/v3/JS/",configUrl:"jssdkcdns.mparticle.com/JS/v2/",identityUrl:"identity.mparticle.com/v1/",aliasUrl:"jssdks.mparticle.com/v1/identity/"},Base64CookieKeys:{csm:1,sa:1,ss:1,ua:1,ui:1,csd:1,ia:1,con:1},SDKv2NonMPIDCookieKeys:{gs:1,cu:1,l:1,globalSettings:1,currentUserMPID:1},HTTPCodes:{noHttpCoverage:-1,activeIdentityRequest:-2,activeSession:-3,validationIssue:-4,nativeIdentityRequest:-5,loggingDisabledOrMissingAPIKey:-6,tooManyRequests:429},FeatureFlags:{ReportBatching:"reportBatching",EventsV3:"eventsV3",EventBatchingIntervalMillis:"eventBatchingIntervalMillis"},DefaultInstance:"default_instance"};

function _typeof(obj) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  }, _typeof(obj);
}

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

var SDKProductActionType;(function(a){a[a.Unknown=0]="Unknown",a[a.AddToCart=1]="AddToCart",a[a.RemoveFromCart=2]="RemoveFromCart",a[a.Checkout=3]="Checkout",a[a.CheckoutOption=4]="CheckoutOption",a[a.Click=5]="Click",a[a.ViewDetail=6]="ViewDetail",a[a.Purchase=7]="Purchase",a[a.Refund=8]="Refund",a[a.AddToWishlist=9]="AddToWishlist",a[a.RemoveFromWishlist=10]="RemoveFromWishlist";})(SDKProductActionType||(SDKProductActionType={}));var SDKIdentityTypeEnum;(function(a){a.other="other",a.customerId="customerid",a.facebook="facebook",a.twitter="twitter",a.google="google",a.microsoft="microsoft",a.yahoo="yahoo",a.email="email",a.alias="alias",a.facebookCustomAudienceId="facebookcustomaudienceid",a.otherId2="other2",a.otherId3="other3",a.otherId4="other4",a.otherId5="other5",a.otherId6="other6",a.otherId7="other7",a.otherId8="other8",a.otherId9="other9",a.otherId10="other10",a.mobileNumber="mobile_number",a.phoneNumber2="phone_number_2",a.phoneNumber3="phone_number_3";})(SDKIdentityTypeEnum||(SDKIdentityTypeEnum={}));

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var dist = {};

(function (exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	(function (ApplicationInformationOsEnum) {
	    ApplicationInformationOsEnum["unknown"] = "Unknown";
	    ApplicationInformationOsEnum["iOS"] = "IOS";
	    ApplicationInformationOsEnum["android"] = "Android";
	    ApplicationInformationOsEnum["windowsPhone"] = "WindowsPhone";
	    ApplicationInformationOsEnum["mobileWeb"] = "MobileWeb";
	    ApplicationInformationOsEnum["unityIOS"] = "UnityIOS";
	    ApplicationInformationOsEnum["unityAndroid"] = "UnityAndroid";
	    ApplicationInformationOsEnum["desktop"] = "Desktop";
	    ApplicationInformationOsEnum["tvOS"] = "TVOS";
	    ApplicationInformationOsEnum["roku"] = "Roku";
	    ApplicationInformationOsEnum["outOfBand"] = "OutOfBand";
	    ApplicationInformationOsEnum["alexa"] = "Alexa";
	    ApplicationInformationOsEnum["smartTV"] = "SmartTV";
	    ApplicationInformationOsEnum["fireTV"] = "FireTV";
	    ApplicationInformationOsEnum["xbox"] = "Xbox";
	})(exports.ApplicationInformationOsEnum || (exports.ApplicationInformationOsEnum = {}));
	(function (ApplicationStateTransitionEventEventTypeEnum) {
	    ApplicationStateTransitionEventEventTypeEnum["applicationStateTransition"] = "application_state_transition";
	})(exports.ApplicationStateTransitionEventEventTypeEnum || (exports.ApplicationStateTransitionEventEventTypeEnum = {}));
	(function (ApplicationStateTransitionEventDataApplicationTransitionTypeEnum) {
	    ApplicationStateTransitionEventDataApplicationTransitionTypeEnum["applicationInitialized"] = "application_initialized";
	    ApplicationStateTransitionEventDataApplicationTransitionTypeEnum["applicationExit"] = "application_exit";
	    ApplicationStateTransitionEventDataApplicationTransitionTypeEnum["applicationBackground"] = "application_background";
	    ApplicationStateTransitionEventDataApplicationTransitionTypeEnum["applicationForeground"] = "application_foreground";
	})(exports.ApplicationStateTransitionEventDataApplicationTransitionTypeEnum || (exports.ApplicationStateTransitionEventDataApplicationTransitionTypeEnum = {}));
	(function (BatchEnvironmentEnum) {
	    BatchEnvironmentEnum["unknown"] = "unknown";
	    BatchEnvironmentEnum["development"] = "development";
	    BatchEnvironmentEnum["production"] = "production";
	})(exports.BatchEnvironmentEnum || (exports.BatchEnvironmentEnum = {}));
	(function (BreadcrumbEventEventTypeEnum) {
	    BreadcrumbEventEventTypeEnum["breadcrumb"] = "breadcrumb";
	})(exports.BreadcrumbEventEventTypeEnum || (exports.BreadcrumbEventEventTypeEnum = {}));
	(function (CommerceEventEventTypeEnum) {
	    CommerceEventEventTypeEnum["commerceEvent"] = "commerce_event";
	})(exports.CommerceEventEventTypeEnum || (exports.CommerceEventEventTypeEnum = {}));
	(function (CommerceEventDataCustomEventTypeEnum) {
	    CommerceEventDataCustomEventTypeEnum["addToCart"] = "add_to_cart";
	    CommerceEventDataCustomEventTypeEnum["removeFromCart"] = "remove_from_cart";
	    CommerceEventDataCustomEventTypeEnum["checkout"] = "checkout";
	    CommerceEventDataCustomEventTypeEnum["checkoutOption"] = "checkout_option";
	    CommerceEventDataCustomEventTypeEnum["click"] = "click";
	    CommerceEventDataCustomEventTypeEnum["viewDetail"] = "view_detail";
	    CommerceEventDataCustomEventTypeEnum["purchase"] = "purchase";
	    CommerceEventDataCustomEventTypeEnum["refund"] = "refund";
	    CommerceEventDataCustomEventTypeEnum["promotionView"] = "promotion_view";
	    CommerceEventDataCustomEventTypeEnum["promotionClick"] = "promotion_click";
	    CommerceEventDataCustomEventTypeEnum["addToWishlist"] = "add_to_wishlist";
	    CommerceEventDataCustomEventTypeEnum["removeFromWishlist"] = "remove_from_wishlist";
	    CommerceEventDataCustomEventTypeEnum["impression"] = "impression";
	})(exports.CommerceEventDataCustomEventTypeEnum || (exports.CommerceEventDataCustomEventTypeEnum = {}));
	(function (CrashReportEventEventTypeEnum) {
	    CrashReportEventEventTypeEnum["crashReport"] = "crash_report";
	})(exports.CrashReportEventEventTypeEnum || (exports.CrashReportEventEventTypeEnum = {}));
	(function (CustomEventEventTypeEnum) {
	    CustomEventEventTypeEnum["customEvent"] = "custom_event";
	})(exports.CustomEventEventTypeEnum || (exports.CustomEventEventTypeEnum = {}));
	(function (CustomEventDataCustomEventTypeEnum) {
	    CustomEventDataCustomEventTypeEnum["navigation"] = "navigation";
	    CustomEventDataCustomEventTypeEnum["location"] = "location";
	    CustomEventDataCustomEventTypeEnum["search"] = "search";
	    CustomEventDataCustomEventTypeEnum["transaction"] = "transaction";
	    CustomEventDataCustomEventTypeEnum["userContent"] = "user_content";
	    CustomEventDataCustomEventTypeEnum["userPreference"] = "user_preference";
	    CustomEventDataCustomEventTypeEnum["social"] = "social";
	    CustomEventDataCustomEventTypeEnum["media"] = "media";
	    CustomEventDataCustomEventTypeEnum["other"] = "other";
	    CustomEventDataCustomEventTypeEnum["unknown"] = "unknown";
	})(exports.CustomEventDataCustomEventTypeEnum || (exports.CustomEventDataCustomEventTypeEnum = {}));
	(function (DeviceCurrentStateDeviceOrientationEnum) {
	    DeviceCurrentStateDeviceOrientationEnum["portrait"] = "portrait";
	    DeviceCurrentStateDeviceOrientationEnum["portraitUpsideDown"] = "portrait_upside_down";
	    DeviceCurrentStateDeviceOrientationEnum["landscape"] = "landscape";
	    DeviceCurrentStateDeviceOrientationEnum["landscapeLeft"] = "LandscapeLeft";
	    DeviceCurrentStateDeviceOrientationEnum["landscapeRight"] = "LandscapeRight";
	    DeviceCurrentStateDeviceOrientationEnum["faceUp"] = "FaceUp";
	    DeviceCurrentStateDeviceOrientationEnum["faceDown"] = "FaceDown";
	    DeviceCurrentStateDeviceOrientationEnum["square"] = "Square";
	})(exports.DeviceCurrentStateDeviceOrientationEnum || (exports.DeviceCurrentStateDeviceOrientationEnum = {}));
	(function (DeviceCurrentStateStatusBarOrientationEnum) {
	    DeviceCurrentStateStatusBarOrientationEnum["portrait"] = "portrait";
	    DeviceCurrentStateStatusBarOrientationEnum["portraitUpsideDown"] = "portrait_upside_down";
	    DeviceCurrentStateStatusBarOrientationEnum["landscape"] = "landscape";
	    DeviceCurrentStateStatusBarOrientationEnum["landscapeLeft"] = "LandscapeLeft";
	    DeviceCurrentStateStatusBarOrientationEnum["landscapeRight"] = "LandscapeRight";
	    DeviceCurrentStateStatusBarOrientationEnum["faceUp"] = "FaceUp";
	    DeviceCurrentStateStatusBarOrientationEnum["faceDown"] = "FaceDown";
	    DeviceCurrentStateStatusBarOrientationEnum["square"] = "Square";
	})(exports.DeviceCurrentStateStatusBarOrientationEnum || (exports.DeviceCurrentStateStatusBarOrientationEnum = {}));
	(function (DeviceInformationPlatformEnum) {
	    DeviceInformationPlatformEnum["iOS"] = "iOS";
	    DeviceInformationPlatformEnum["android"] = "Android";
	    DeviceInformationPlatformEnum["web"] = "web";
	    DeviceInformationPlatformEnum["desktop"] = "desktop";
	    DeviceInformationPlatformEnum["tvOS"] = "tvOS";
	    DeviceInformationPlatformEnum["roku"] = "roku";
	    DeviceInformationPlatformEnum["outOfBand"] = "out_of_band";
	    DeviceInformationPlatformEnum["smartTV"] = "smart_tv";
	    DeviceInformationPlatformEnum["xbox"] = "xbox";
	})(exports.DeviceInformationPlatformEnum || (exports.DeviceInformationPlatformEnum = {}));
	(function (EventTypeEnum) {
	    EventTypeEnum["unknown"] = "unknown";
	    EventTypeEnum["sessionStart"] = "session_start";
	    EventTypeEnum["sessionEnd"] = "session_end";
	    EventTypeEnum["screenView"] = "screen_view";
	    EventTypeEnum["customEvent"] = "custom_event";
	    EventTypeEnum["crashReport"] = "crash_report";
	    EventTypeEnum["optOut"] = "opt_out";
	    EventTypeEnum["firstRun"] = "first_run";
	    EventTypeEnum["preAttribution"] = "pre_attribution";
	    EventTypeEnum["pushRegistration"] = "push_registration";
	    EventTypeEnum["applicationStateTransition"] = "application_state_transition";
	    EventTypeEnum["pushMessage"] = "push_message";
	    EventTypeEnum["networkPerformance"] = "network_performance";
	    EventTypeEnum["breadcrumb"] = "breadcrumb";
	    EventTypeEnum["profile"] = "profile";
	    EventTypeEnum["pushReaction"] = "push_reaction";
	    EventTypeEnum["commerceEvent"] = "commerce_event";
	    EventTypeEnum["userAttributeChange"] = "user_attribute_change";
	    EventTypeEnum["userIdentityChange"] = "user_identity_change";
	    EventTypeEnum["uninstall"] = "uninstall";
	    EventTypeEnum["validationResult"] = "validation_result";
	})(exports.EventTypeEnum || (exports.EventTypeEnum = {}));
	(function (IdentityTypeEnum) {
	    IdentityTypeEnum["other"] = "other";
	    IdentityTypeEnum["customerId"] = "customer_id";
	    IdentityTypeEnum["facebook"] = "facebook";
	    IdentityTypeEnum["twitter"] = "twitter";
	    IdentityTypeEnum["google"] = "google";
	    IdentityTypeEnum["microsoft"] = "microsoft";
	    IdentityTypeEnum["yahoo"] = "yahoo";
	    IdentityTypeEnum["email"] = "email";
	    IdentityTypeEnum["alias"] = "alias";
	    IdentityTypeEnum["facebookCustomAudienceId"] = "facebook_custom_audience_id";
	    IdentityTypeEnum["otherId2"] = "other_id_2";
	    IdentityTypeEnum["otherId3"] = "other_id_3";
	    IdentityTypeEnum["otherId4"] = "other_id_4";
	    IdentityTypeEnum["otherId5"] = "other_id_5";
	    IdentityTypeEnum["otherId6"] = "other_id_6";
	    IdentityTypeEnum["otherId7"] = "other_id_7";
	    IdentityTypeEnum["otherId8"] = "other_id_8";
	    IdentityTypeEnum["otherId9"] = "other_id_9";
	    IdentityTypeEnum["otherId10"] = "other_id_10";
	    IdentityTypeEnum["mobileNumber"] = "mobile_number";
	    IdentityTypeEnum["phoneNumber2"] = "phone_number_2";
	    IdentityTypeEnum["phoneNumber3"] = "phone_number_3";
	})(exports.IdentityTypeEnum || (exports.IdentityTypeEnum = {}));
	(function (NetworkPerformanceEventEventTypeEnum) {
	    NetworkPerformanceEventEventTypeEnum["networkPerformance"] = "network_performance";
	})(exports.NetworkPerformanceEventEventTypeEnum || (exports.NetworkPerformanceEventEventTypeEnum = {}));
	(function (OptOutEventEnum) {
	    OptOutEventEnum["optOut"] = "opt_out";
	})(exports.OptOutEventEnum || (exports.OptOutEventEnum = {}));
	(function (ProductActionActionEnum) {
	    ProductActionActionEnum["unknown"] = "unknown";
	    ProductActionActionEnum["addToCart"] = "add_to_cart";
	    ProductActionActionEnum["removeFromCart"] = "remove_from_cart";
	    ProductActionActionEnum["checkout"] = "checkout";
	    ProductActionActionEnum["checkoutOption"] = "checkout_option";
	    ProductActionActionEnum["click"] = "click";
	    ProductActionActionEnum["viewDetail"] = "view_detail";
	    ProductActionActionEnum["purchase"] = "purchase";
	    ProductActionActionEnum["refund"] = "refund";
	    ProductActionActionEnum["addToWishlist"] = "add_to_wishlist";
	    ProductActionActionEnum["removeFromWishlist"] = "remove_from_wish_list";
	})(exports.ProductActionActionEnum || (exports.ProductActionActionEnum = {}));
	(function (ProfileEventEventTypeEnum) {
	    ProfileEventEventTypeEnum["profile"] = "profile";
	})(exports.ProfileEventEventTypeEnum || (exports.ProfileEventEventTypeEnum = {}));
	(function (ProfileEventDataProfileEventTypeEnum) {
	    ProfileEventDataProfileEventTypeEnum["signup"] = "signup";
	    ProfileEventDataProfileEventTypeEnum["login"] = "login";
	    ProfileEventDataProfileEventTypeEnum["logout"] = "logout";
	    ProfileEventDataProfileEventTypeEnum["update"] = "update";
	    ProfileEventDataProfileEventTypeEnum["delete"] = "delete";
	})(exports.ProfileEventDataProfileEventTypeEnum || (exports.ProfileEventDataProfileEventTypeEnum = {}));
	(function (PromotionActionActionEnum) {
	    PromotionActionActionEnum["view"] = "view";
	    PromotionActionActionEnum["click"] = "click";
	})(exports.PromotionActionActionEnum || (exports.PromotionActionActionEnum = {}));
	(function (PushMessageEventEventTypeEnum) {
	    PushMessageEventEventTypeEnum["pushMessage"] = "push_message";
	})(exports.PushMessageEventEventTypeEnum || (exports.PushMessageEventEventTypeEnum = {}));
	(function (PushMessageEventDataPushMessageTypeEnum) {
	    PushMessageEventDataPushMessageTypeEnum["sent"] = "sent";
	    PushMessageEventDataPushMessageTypeEnum["received"] = "received";
	    PushMessageEventDataPushMessageTypeEnum["action"] = "action";
	})(exports.PushMessageEventDataPushMessageTypeEnum || (exports.PushMessageEventDataPushMessageTypeEnum = {}));
	(function (PushMessageEventDataApplicationStateEnum) {
	    PushMessageEventDataApplicationStateEnum["notRunning"] = "not_running";
	    PushMessageEventDataApplicationStateEnum["background"] = "background";
	    PushMessageEventDataApplicationStateEnum["foreground"] = "foreground";
	})(exports.PushMessageEventDataApplicationStateEnum || (exports.PushMessageEventDataApplicationStateEnum = {}));
	(function (PushMessageEventDataPushMessageBehaviorEnum) {
	    PushMessageEventDataPushMessageBehaviorEnum["received"] = "Received";
	    PushMessageEventDataPushMessageBehaviorEnum["directOpen"] = "DirectOpen";
	    PushMessageEventDataPushMessageBehaviorEnum["read"] = "Read";
	    PushMessageEventDataPushMessageBehaviorEnum["influencedOpen"] = "InfluencedOpen";
	    PushMessageEventDataPushMessageBehaviorEnum["displayed"] = "Displayed";
	})(exports.PushMessageEventDataPushMessageBehaviorEnum || (exports.PushMessageEventDataPushMessageBehaviorEnum = {}));
	(function (PushRegistrationEventEventTypeEnum) {
	    PushRegistrationEventEventTypeEnum["pushRegistration"] = "push_registration";
	})(exports.PushRegistrationEventEventTypeEnum || (exports.PushRegistrationEventEventTypeEnum = {}));
	(function (SessionEndEventEventTypeEnum) {
	    SessionEndEventEventTypeEnum["sessionEnd"] = "session_end";
	})(exports.SessionEndEventEventTypeEnum || (exports.SessionEndEventEventTypeEnum = {}));
	(function (SessionStartEventEventTypeEnum) {
	    SessionStartEventEventTypeEnum["sessionStart"] = "session_start";
	})(exports.SessionStartEventEventTypeEnum || (exports.SessionStartEventEventTypeEnum = {}));
	(function (SourceInformationChannelEnum) {
	    SourceInformationChannelEnum["native"] = "native";
	    SourceInformationChannelEnum["javascript"] = "javascript";
	    SourceInformationChannelEnum["pixel"] = "pixel";
	    SourceInformationChannelEnum["desktop"] = "desktop";
	    SourceInformationChannelEnum["partner"] = "partner";
	    SourceInformationChannelEnum["serverToServer"] = "server_to_server";
	})(exports.SourceInformationChannelEnum || (exports.SourceInformationChannelEnum = {}));
	(function (UserAttributeChangeEventEventTypeEnum) {
	    UserAttributeChangeEventEventTypeEnum["userAttributeChange"] = "user_attribute_change";
	})(exports.UserAttributeChangeEventEventTypeEnum || (exports.UserAttributeChangeEventEventTypeEnum = {}));
	(function (UserIdentityChangeEventEventTypeEnum) {
	    UserIdentityChangeEventEventTypeEnum["userIdentityChange"] = "user_identity_change";
	})(exports.UserIdentityChangeEventEventTypeEnum || (exports.UserIdentityChangeEventEventTypeEnum = {}));
} (dist));

function convertEvents(a,b,c){if(!a)return null;if(!b||1>b.length)return null;for(var d,e=[],f=null,g=0,h=b;g<h.length;g++)if(d=h[g],d){f=d;var i=convertEvent(d);i&&e.push(i);}if(!f)return null;var j={source_request_id:c._Helpers.generateUniqueId(),mpid:a,timestamp_unixtime_ms:new Date().getTime(),environment:f.Debug?dist.BatchEnvironmentEnum.development:dist.BatchEnvironmentEnum.production,events:e,mp_deviceid:f.DeviceId,sdk_version:f.SDKVersion,application_info:{application_version:f.AppVersion,application_name:f.AppName,package:f.Package},device_info:{platform:dist.DeviceInformationPlatformEnum.web,screen_width:window.screen.width,screen_height:window.screen.height},user_attributes:f.UserAttributes,user_identities:convertUserIdentities(f.UserIdentities),consent_state:convertConsentState(f.ConsentState),integration_attributes:f.IntegrationAttributes};return f.DataPlan&&f.DataPlan.PlanId&&(j.context={data_plan:{plan_id:f.DataPlan.PlanId,plan_version:f.DataPlan.PlanVersion||void 0}}),j}function convertConsentState(a){if(!a)return null;var b={gdpr:convertGdprConsentState(a.getGDPRConsentState()),ccpa:convertCcpaConsentState(a.getCCPAConsentState())};return b}function convertGdprConsentState(a){if(!a)return null;var b={};for(var c in a)a.hasOwnProperty(c)&&(b[c]={consented:a[c].Consented,hardware_id:a[c].HardwareId,document:a[c].ConsentDocument,timestamp_unixtime_ms:a[c].Timestamp,location:a[c].Location});return b}function convertCcpaConsentState(a){if(!a)return null;var b={data_sale_opt_out:{consented:a.Consented,hardware_id:a.HardwareId,document:a.ConsentDocument,timestamp_unixtime_ms:a.Timestamp,location:a.Location}};return b}function convertUserIdentities(a){if(!a||!a.length)return null;for(var b,c={},d=0,e=a;d<e.length;d++)switch(b=e[d],b.Type){case Types.IdentityType.CustomerId:c.customer_id=b.Identity;break;case Types.IdentityType.Email:c.email=b.Identity;break;case Types.IdentityType.Facebook:c.facebook=b.Identity;break;case Types.IdentityType.FacebookCustomAudienceId:c.facebook_custom_audience_id=b.Identity;break;case Types.IdentityType.Google:c.google=b.Identity;break;case Types.IdentityType.Microsoft:c.microsoft=b.Identity;break;case Types.IdentityType.Other:c.other=b.Identity;break;case Types.IdentityType.Other2:c.other_id_2=b.Identity;break;case Types.IdentityType.Other3:c.other_id_3=b.Identity;break;case Types.IdentityType.Other4:c.other_id_4=b.Identity;break;case Types.IdentityType.Other5:c.other_id_5=b.Identity;break;case Types.IdentityType.Other6:c.other_id_6=b.Identity;break;case Types.IdentityType.Other7:c.other_id_7=b.Identity;break;case Types.IdentityType.Other8:c.other_id_8=b.Identity;break;case Types.IdentityType.Other9:c.other_id_9=b.Identity;break;case Types.IdentityType.Other10:c.other_id_10=b.Identity;break;case Types.IdentityType.MobileNumber:c.mobile_number=b.Identity;break;case Types.IdentityType.PhoneNumber2:c.phone_number_2=b.Identity;break;case Types.IdentityType.PhoneNumber3:c.phone_number_3=b.Identity;break;}return c}function convertEvent(a){if(!a)return null;switch(a.EventDataType){case Types.MessageType.AppStateTransition:return convertAST(a);case Types.MessageType.Commerce:return convertCommerceEvent(a);case Types.MessageType.CrashReport:return convertCrashReportEvent(a);case Types.MessageType.OptOut:return convertOptOutEvent(a);case Types.MessageType.PageEvent:// Note: Media Events are also sent as PageEvents/CustomEvents
return convertCustomEvent(a);case Types.MessageType.PageView:return convertPageViewEvent(a);case Types.MessageType.Profile://deprecated and not supported by the web SDK
return null;case Types.MessageType.SessionEnd:return convertSessionEndEvent(a);case Types.MessageType.SessionStart:return convertSessionStartEvent(a);case Types.MessageType.UserAttributeChange:return convertUserAttributeChangeEvent(a);case Types.MessageType.UserIdentityChange:return convertUserIdentityChangeEvent(a);}return null}function convertProductActionType(a){if(!a)return dist.ProductActionActionEnum.unknown;return a===SDKProductActionType.AddToCart?dist.ProductActionActionEnum.addToCart:a===SDKProductActionType.AddToWishlist?dist.ProductActionActionEnum.addToWishlist:a===SDKProductActionType.Checkout?dist.ProductActionActionEnum.checkout:a===SDKProductActionType.CheckoutOption?dist.ProductActionActionEnum.checkoutOption:a===SDKProductActionType.Click?dist.ProductActionActionEnum.click:a===SDKProductActionType.Purchase?dist.ProductActionActionEnum.purchase:a===SDKProductActionType.Refund?dist.ProductActionActionEnum.refund:a===SDKProductActionType.RemoveFromCart?dist.ProductActionActionEnum.removeFromCart:a===SDKProductActionType.RemoveFromWishlist?dist.ProductActionActionEnum.removeFromWishlist:a===SDKProductActionType.ViewDetail?dist.ProductActionActionEnum.viewDetail:dist.ProductActionActionEnum.unknown}function convertProductAction(a){if(!a.ProductAction)return null;var b={action:convertProductActionType(a.ProductAction.ProductActionType),checkout_step:a.ProductAction.CheckoutStep,checkout_options:a.ProductAction.CheckoutOptions,transaction_id:a.ProductAction.TransactionId,affiliation:a.ProductAction.Affiliation,total_amount:a.ProductAction.TotalAmount,tax_amount:a.ProductAction.TaxAmount,shipping_amount:a.ProductAction.ShippingAmount,coupon_code:a.ProductAction.CouponCode,products:convertProducts(a.ProductAction.ProductList)};return b}function convertProducts(a){if(!a||!a.length)return null;for(var b=[],c=0,d=a;c<d.length;c++){var e=d[c],f={id:e.Sku,name:e.Name,brand:e.Brand,category:e.Category,variant:e.Variant,total_product_amount:e.TotalAmount,position:e.Position,price:e.Price,quantity:e.Quantity,coupon_code:e.CouponCode,custom_attributes:e.Attributes};b.push(f);}return b}function convertPromotionAction(a){if(!a.PromotionAction)return null;var b={action:a.PromotionAction.PromotionActionType,promotions:convertPromotions(a.PromotionAction.PromotionList)};return b}function convertPromotions(a){if(!a||!a.length)return null;for(var b=[],c=0,d=a;c<d.length;c++){var e=d[c],f={id:e.Id,name:e.Name,creative:e.Creative,position:e.Position};b.push(f);}return b}function convertImpressions(a){if(!a.ProductImpressions)return null;for(var b=[],c=0,d=a.ProductImpressions;c<d.length;c++){var e=d[c],f={product_impression_list:e.ProductImpressionList,products:convertProducts(e.ProductList)};b.push(f);}return b}function convertShoppingCart(a){if(!a.ShoppingCart||!a.ShoppingCart.ProductList||!a.ShoppingCart.ProductList.length)return null;var b={products:convertProducts(a.ShoppingCart.ProductList)};return b}function convertCommerceEvent(a){var b=convertBaseEventData(a),c={custom_flags:a.CustomFlags,product_action:convertProductAction(a),promotion_action:convertPromotionAction(a),product_impressions:convertImpressions(a),shopping_cart:convertShoppingCart(a),currency_code:a.CurrencyCode};return c=Object.assign(c,b),{event_type:dist.EventTypeEnum.commerceEvent,data:c}}function convertCrashReportEvent(a){var b=convertBaseEventData(a),c={message:a.EventName};return c=Object.assign(c,b),{event_type:dist.EventTypeEnum.crashReport,data:c}}function convertAST(a){var b=convertBaseEventData(a),c={application_transition_type:dist.ApplicationStateTransitionEventDataApplicationTransitionTypeEnum.applicationInitialized,is_first_run:a.IsFirstRun,is_upgrade:!1,launch_referral:a.LaunchReferral};return c=Object.assign(c,b),{event_type:dist.EventTypeEnum.applicationStateTransition,data:c}}function convertSessionEndEvent(a){var b=convertBaseEventData(a),c={session_duration_ms:a.SessionLength//note: External Events DTO does not support the session mpids array as of this time.
//spanning_mpids: sdkEvent.SessionMpids
};return c=Object.assign(c,b),{event_type:dist.EventTypeEnum.sessionEnd,data:c}}function convertSessionStartEvent(a){var b=convertBaseEventData(a),c={};return c=Object.assign(c,b),{event_type:dist.EventTypeEnum.sessionStart,data:c}}function convertPageViewEvent(a){var b=convertBaseEventData(a),c={custom_flags:a.CustomFlags,screen_name:a.EventName};return c=Object.assign(c,b),{event_type:dist.EventTypeEnum.screenView,data:c}}function convertOptOutEvent(a){var b=convertBaseEventData(a),c={is_opted_out:a.OptOut};return c=Object.assign(c,b),{event_type:dist.EventTypeEnum.optOut,data:c}}function convertCustomEvent(a){var b=convertBaseEventData(a),c={custom_event_type:convertSdkEventType(a.EventCategory),custom_flags:a.CustomFlags,event_name:a.EventName};return c=Object.assign(c,b),{event_type:dist.EventTypeEnum.customEvent,data:c}}function convertSdkEventType(a){return a===Types.EventType.Other?dist.CustomEventDataCustomEventTypeEnum.other:a===Types.EventType.Location?dist.CustomEventDataCustomEventTypeEnum.location:a===Types.EventType.Navigation?dist.CustomEventDataCustomEventTypeEnum.navigation:a===Types.EventType.Search?dist.CustomEventDataCustomEventTypeEnum.search:a===Types.EventType.Social?dist.CustomEventDataCustomEventTypeEnum.social:a===Types.EventType.Transaction?dist.CustomEventDataCustomEventTypeEnum.transaction:a===Types.EventType.UserContent?dist.CustomEventDataCustomEventTypeEnum.userContent:a===Types.EventType.UserPreference?dist.CustomEventDataCustomEventTypeEnum.userPreference:a===Types.EventType.Media?dist.CustomEventDataCustomEventTypeEnum.media:a===Types.CommerceEventType.ProductAddToCart?dist.CommerceEventDataCustomEventTypeEnum.addToCart:a===Types.CommerceEventType.ProductAddToWishlist?dist.CommerceEventDataCustomEventTypeEnum.addToWishlist:a===Types.CommerceEventType.ProductCheckout?dist.CommerceEventDataCustomEventTypeEnum.checkout:a===Types.CommerceEventType.ProductCheckoutOption?dist.CommerceEventDataCustomEventTypeEnum.checkoutOption:a===Types.CommerceEventType.ProductClick?dist.CommerceEventDataCustomEventTypeEnum.click:a===Types.CommerceEventType.ProductImpression?dist.CommerceEventDataCustomEventTypeEnum.impression:a===Types.CommerceEventType.ProductPurchase?dist.CommerceEventDataCustomEventTypeEnum.purchase:a===Types.CommerceEventType.ProductRefund?dist.CommerceEventDataCustomEventTypeEnum.refund:a===Types.CommerceEventType.ProductRemoveFromCart?dist.CommerceEventDataCustomEventTypeEnum.removeFromCart:a===Types.CommerceEventType.ProductRemoveFromWishlist?dist.CommerceEventDataCustomEventTypeEnum.removeFromWishlist:a===Types.CommerceEventType.ProductViewDetail?dist.CommerceEventDataCustomEventTypeEnum.viewDetail:a===Types.CommerceEventType.PromotionClick?dist.CommerceEventDataCustomEventTypeEnum.promotionClick:a===Types.CommerceEventType.PromotionView?dist.CommerceEventDataCustomEventTypeEnum.promotionView:dist.CustomEventDataCustomEventTypeEnum.unknown}function convertBaseEventData(a){var b={timestamp_unixtime_ms:a.Timestamp,session_uuid:a.SessionId,session_start_unixtime_ms:a.SessionStartDate,custom_attributes:a.EventAttributes,location:convertSDKLocation(a.Location),source_message_id:a.SourceMessageId};return b}function convertSDKLocation(a){return a&&Object.keys(a).length?{latitude:a.lat,longitude:a.lng}:null}function convertUserAttributeChangeEvent(a){var b=convertBaseEventData(a),c={user_attribute_name:a.UserAttributeChanges.UserAttributeName,new:a.UserAttributeChanges.New,old:a.UserAttributeChanges.Old,deleted:a.UserAttributeChanges.Deleted,is_new_attribute:a.UserAttributeChanges.IsNewAttribute};return c=__assign(__assign({},c),b),{event_type:dist.EventTypeEnum.userAttributeChange,data:c}}function convertUserIdentityChangeEvent(a){var b=convertBaseEventData(a),c={new:{identity_type:convertUserIdentityTypeToServerIdentityType(a.UserIdentityChanges.New.IdentityType),identity:a.UserIdentityChanges.New.Identity||null,timestamp_unixtime_ms:a.Timestamp,created_this_batch:a.UserIdentityChanges.New.CreatedThisBatch},old:{identity_type:convertUserIdentityTypeToServerIdentityType(a.UserIdentityChanges.Old.IdentityType),identity:a.UserIdentityChanges.Old.Identity||null,timestamp_unixtime_ms:a.Timestamp,created_this_batch:a.UserIdentityChanges.Old.CreatedThisBatch}};return c=Object.assign(c,b),{event_type:dist.EventTypeEnum.userIdentityChange,data:c}}function convertUserIdentityTypeToServerIdentityType(a){return a===SDKIdentityTypeEnum.other?dist.IdentityTypeEnum.other:a===SDKIdentityTypeEnum.customerId?dist.IdentityTypeEnum.customerId:a===SDKIdentityTypeEnum.facebook?dist.IdentityTypeEnum.facebook:a===SDKIdentityTypeEnum.twitter?dist.IdentityTypeEnum.twitter:a===SDKIdentityTypeEnum.google?dist.IdentityTypeEnum.google:a===SDKIdentityTypeEnum.microsoft?dist.IdentityTypeEnum.microsoft:a===SDKIdentityTypeEnum.yahoo?dist.IdentityTypeEnum.yahoo:a===SDKIdentityTypeEnum.email?dist.IdentityTypeEnum.email:a===SDKIdentityTypeEnum.alias?dist.IdentityTypeEnum.alias:a===SDKIdentityTypeEnum.facebookCustomAudienceId?dist.IdentityTypeEnum.facebookCustomAudienceId:a===SDKIdentityTypeEnum.otherId2?dist.IdentityTypeEnum.otherId2:a===SDKIdentityTypeEnum.otherId3?dist.IdentityTypeEnum.otherId3:a===SDKIdentityTypeEnum.otherId4?dist.IdentityTypeEnum.otherId4:a===SDKIdentityTypeEnum.otherId5?dist.IdentityTypeEnum.otherId5:a===SDKIdentityTypeEnum.otherId6?dist.IdentityTypeEnum.otherId6:a===SDKIdentityTypeEnum.otherId7?dist.IdentityTypeEnum.otherId7:a===SDKIdentityTypeEnum.otherId8?dist.IdentityTypeEnum.otherId8:a===SDKIdentityTypeEnum.otherId9?dist.IdentityTypeEnum.otherId9:a===SDKIdentityTypeEnum.otherId10?dist.IdentityTypeEnum.otherId10:a===SDKIdentityTypeEnum.mobileNumber?dist.IdentityTypeEnum.mobileNumber:a===SDKIdentityTypeEnum.phoneNumber2?dist.IdentityTypeEnum.phoneNumber2:a===SDKIdentityTypeEnum.phoneNumber3?dist.IdentityTypeEnum.phoneNumber3:void 0}

var BatchUploader=/** @class */function(){function a(b,c){var d=this;this.mpInstance=b,this.uploadIntervalMillis=c,this.batchingEnabled=c>=a.MINIMUM_INTERVAL_MILLIS,this.uploadIntervalMillis<a.MINIMUM_INTERVAL_MILLIS&&(this.uploadIntervalMillis=a.MINIMUM_INTERVAL_MILLIS),this.pendingEvents=[],this.pendingUploads=[];var e=this.mpInstance._Store,f=e.SDKConfig,g=e.devToken,h=this.mpInstance._Helpers.createServiceUrl(f.v3SecureServiceUrl,g);this.uploadUrl="".concat(h,"/events"),setTimeout(function(){d.prepareAndUpload(!0,!1);},this.uploadIntervalMillis),this.addEventListeners();}return a.prototype.addEventListeners=function(){var a=this;document.addEventListener("visibilitychange",function(){a.prepareAndUpload(!1,a.isBeaconAvailable());}),window.addEventListener("beforeunload",function(){a.prepareAndUpload(!1,a.isBeaconAvailable());}),window.addEventListener("pagehide",function(){a.prepareAndUpload(!1,a.isBeaconAvailable());});},a.prototype.isBeaconAvailable=function(){return !!navigator.sendBeacon},a.prototype.queueEvent=function(a){a&&(this.pendingEvents.push(a),this.mpInstance.Logger.verbose("Queuing event: ".concat(JSON.stringify(a))),this.mpInstance.Logger.verbose("Queued event count: ".concat(this.pendingEvents.length)),(!this.batchingEnabled||Types.TriggerUploadType[a.EventDataType])&&this.prepareAndUpload(!1,!1));},a.createNewUploads=function(a,b,c){if(!b||!a||!a.length)return null;//bucket by MPID, and then by session, ordered by timestamp
for(var d,e=[],f=new Map,g=0,h=a;g<h.length;g++){//on initial startup, there may be events logged without an mpid.
if(d=h[g],!d.MPID){var i=b.getMPID();d.MPID=i;}var j=f.get(d.MPID);j||(j=[]),j.push(d),f.set(d.MPID,j);}for(var k=0,l=Array.from(f.entries());k<l.length;k++){for(var m=l[k],i=m[0],n=m[1],o=new Map,p=0,q=n;p<q.length;p++){var d=q[p],j=o.get(d.SessionId);j||(j=[]),j.push(d),o.set(d.SessionId,j);}for(var r=0,s=Array.from(o.entries());r<s.length;r++){var t=s[r],u=convertEvents(i,t[1],c),v=c._Store.SDKConfig.onCreateBatch;v&&(u=v(u),u?u.modified=!0:c.Logger.warning("Skiping batch upload because no batch was returned from onCreateBatch callback")),u&&e.push(u);}}return e},a.prototype.prepareAndUpload=function(b,c){return __awaiter(this,void 0,void 0,function(){var d,e,f,g,h,i,j,k=this;return __generator(this,function(l){switch(l.label){case 0:return d=this.mpInstance.Identity.getCurrentUser(),e=this.pendingEvents,this.pendingEvents=[],f=a.createNewUploads(e,d,this.mpInstance),f&&f.length&&(i=this.pendingUploads).push.apply(i,f),g=this.pendingUploads,this.pendingUploads=[],[4/*yield*/,this.upload(this.mpInstance.Logger,g,c)];case 1:return h=l.sent(),h&&h.length&&(j=this.pendingUploads).unshift.apply(j,h),b&&setTimeout(function(){k.prepareAndUpload(!0,!1);},this.uploadIntervalMillis),[2/*return*/];}})})},a.prototype.upload=function(b,c,d){return __awaiter(this,void 0,void 0,function(){var e,f,g,h,j,k;return __generator(this,function(i){switch(i.label){case 0:if(!c||1>c.length)return [2/*return*/,null];b.verbose("Uploading batches: ".concat(JSON.stringify(c))),b.verbose("Batch count: ".concat(c.length)),f=0,i.label=1;case 1:return f<c.length?(g={method:"POST",headers:{Accept:a.CONTENT_TYPE,"Content-Type":"text/plain;charset=UTF-8"},body:JSON.stringify(c[f])},!(d&&this.isBeaconAvailable()))?[3/*break*/,2]:(h=new Blob([g.body],{type:"text/plain;charset=UTF-8"}),navigator.sendBeacon(this.uploadUrl,h),[3/*break*/,6]):[3/*break*/,7];case 2:e||(window.fetch?e=new FetchUploader(this.uploadUrl,b):e=new XHRUploader(this.uploadUrl,b)),i.label=3;case 3:return i.trys.push([3,5,,6]),[4/*yield*/,e.upload(g,c,f)];case 4:if(j=i.sent(),200<=j.status&&300>j.status)b.verbose("Upload success for request ID: ".concat(c[f].source_request_id));else {if(500<=j.status||429===j.status)//server error, add back current events and try again later
return b.error("HTTP error status ".concat(j.status," received")),[2/*return*/,c.slice(f,c.length)];if(401<=j.status)//if we're getting a 401, assume we'll keep getting a 401 and clear the uploads.
return b.error("HTTP error status ".concat(j.status," while uploading - please verify your API key.")),[2/*return*/,null]}return [3/*break*/,6];case 5:return k=i.sent(),b.error("Error sending event to mParticle servers. ".concat(k)),[2/*return*/,c.slice(f,c.length)];case 6:return f++,[3/*break*/,1];case 7:return [2/*return*/,null];}})})},a.CONTENT_TYPE="text/plain;charset=UTF-8",a.MINIMUM_INTERVAL_MILLIS=500,a}();var AsyncUploader=/** @class */function(){function a(a,b){this.url=a,this.logger=b;}return a}(),FetchUploader=/** @class */function(a){function b(){return null!==a&&a.apply(this,arguments)||this}return __extends(b,a),b.prototype.upload=function(a){return __awaiter(this,void 0,void 0,function(){var b;return __generator(this,function(c){switch(c.label){case 0:return [4/*yield*/,fetch(this.url,a)];case 1:return b=c.sent(),[2/*return*/,b];}})})},b}(AsyncUploader),XHRUploader=/** @class */function(a){function b(){return null!==a&&a.apply(this,arguments)||this}return __extends(b,a),b.prototype.upload=function(a){return __awaiter(this,void 0,void 0,function(){var b;return __generator(this,function(c){switch(c.label){case 0:return [4/*yield*/,this.makeRequest(this.url,this.logger,a.body)];case 1:return b=c.sent(),[2/*return*/,b];}})})},b.prototype.makeRequest=function(a,b,c){return __awaiter(this,void 0,void 0,function(){var b;return __generator(this,function(){return b=new XMLHttpRequest,[2/*return*/,new Promise(function(d,e){b.onreadystatechange=function(){4!==b.readyState||(200<=b.status&&300>b.status?d(b):e(b));},b.open("post",a),b.send(c);})]})})},b}(AsyncUploader);

var Messages$9=Constants.Messages;function APIClient(a,b){this.uploader=null;var c=this;this.queueEventForBatchUpload=function(b){if(!this.uploader){var c=a._Helpers.getFeatureFlag(Constants.FeatureFlags.EventBatchingIntervalMillis);this.uploader=new BatchUploader(a,c);}this.uploader.queueEvent(b),a._Persistence.update();},this.shouldEnableBatching=function(){// Returns a string of a number that must be parsed
// Invalid strings will be parsed to NaN which is falsey
var b=parseInt(a._Helpers.getFeatureFlag(Constants.FeatureFlags.EventsV3),10);if(!b)return !1;var c=a._Helpers.getRampNumber(a._Store.deviceId);return b>=c},this.processQueuedEvents=function(){var b,d=a.Identity.getCurrentUser();if(d&&(b=d.getMPID()),a._Store.eventQueue.length&&b){var e=a._Store.eventQueue;a._Store.eventQueue=[],this.appendUserInfoToEvents(d,e),e.forEach(function(a){c.sendEventToServer(a);});}},this.appendUserInfoToEvents=function(b,c){c.forEach(function(c){c.MPID||a._ServerModel.appendUserInfo(b,c);});},this.sendEventToServer=function(c,d){var e=a._Helpers.extend({shouldUploadEvent:!0},d);if(a._Store.webviewBridgeEnabled)return void a._NativeSdkHelpers.sendToNative(Constants.NativeSdkPaths.LogEvent,JSON.stringify(c));var f,g=a.Identity.getCurrentUser();// We queue events if there is no MPID (MPID is null, or === 0), or there are integrations that that require this to stall because integration attributes
// need to be set, or if we are still fetching the config (self hosted only), and so require delaying events
return g&&(f=g.getMPID()),a._Store.requireDelay=a._Helpers.isDelayedByIntegration(a._preInit.integrationDelays,a._Store.integrationDelayTimeoutStart,Date.now()),f&&!a._Store.requireDelay&&a._Store.configurationLoaded?void(this.processQueuedEvents(),c&&e.shouldUploadEvent&&(this.shouldEnableBatching()?this.queueEventForBatchUpload(c):this.sendSingleEventToServer(c)),c&&c.EventName!==Types.MessageType.AppStateTransition&&(b&&b.kitBlockingEnabled&&(c=b.createBlockedEvent(c)),c&&a._Forwarders.sendEventToForwarders(c))):(a.Logger.verbose("Event was added to eventQueue. eventQueue will be processed once a valid MPID is returned or there is no more integration imposed delay."),void a._Store.eventQueue.push(c))},this.sendSingleEventToServer=function(b){if(b.EventDataType!==Types.MessageType.Media){var c,d=function xhrCallback(){4===c.readyState&&(a.Logger.verbose("Received "+c.statusText+" from server"),a._Persistence.update());};if(!b)return void a.Logger.error(Messages$9.ErrorMessages.EventEmpty);if(a.Logger.verbose(Messages$9.InformationMessages.SendHttp),c=a._Helpers.createXHR(d),c)try{c.open("post",a._Helpers.createServiceUrl(a._Store.SDKConfig.v2SecureServiceUrl,a._Store.devToken)+"/Events"),c.send(JSON.stringify(a._ServerModel.convertEventToDTO(b)));}catch(b){a.Logger.error("Error sending event to mParticle servers. "+b);}}},this.sendBatchForwardingStatsToServer=function(b,c){var d,e;try{d=a._Helpers.createServiceUrl(a._Store.SDKConfig.v2SecureServiceUrl,a._Store.devToken),e={uuid:a._Helpers.generateUniqueId(),data:b},c&&(c.open("post",d+"/Forwarding"),c.send(JSON.stringify(e)));}catch(b){a.Logger.error("Error sending forwarding stats to mParticle servers.");}},this.sendSingleForwardingStatsToServer=function(b){var c,d;try{var e=function xhrCallback(){4===f.readyState&&202===f.status&&a.Logger.verbose("Successfully sent  "+f.statusText+" from server");},f=a._Helpers.createXHR(e);c=a._Helpers.createServiceUrl(a._Store.SDKConfig.v1SecureServiceUrl,a._Store.devToken),d=b,f&&(f.open("post",c+"/Forwarding"),f.send(JSON.stringify(d)));}catch(b){a.Logger.error("Error sending forwarding stats to mParticle servers.");}},this.prepareForwardingStats=function(b,d){var e,f=a._Forwarders.getForwarderStatsQueue();b&&b.isVisible&&(e={mid:b.id,esid:b.eventSubscriptionId,n:d.EventName,attrs:d.EventAttributes,sdk:d.SDKVersion,dt:d.EventDataType,et:d.EventCategory,dbg:d.Debug,ct:d.Timestamp,eec:d.ExpandedEventCount,dp:d.DataPlan},a._Helpers.getFeatureFlag(Constants.FeatureFlags.ReportBatching)?(f.push(e),a._Forwarders.setForwarderStatsQueue(f)):c.sendSingleForwardingStatsToServer(e));};}

var slugify = {exports: {}};

(function (module, exports) {
(function (name, root, factory) {
	  {
	    module.exports = factory();
	    module.exports['default'] = factory();
	  }
	}('slugify', commonjsGlobal, function () {
	  var charMap = JSON.parse('{"$":"dollar","%":"percent","&":"and","<":"less",">":"greater","|":"or","¢":"cent","£":"pound","¤":"currency","¥":"yen","©":"(c)","ª":"a","®":"(r)","º":"o","À":"A","Á":"A","Â":"A","Ã":"A","Ä":"A","Å":"A","Æ":"AE","Ç":"C","È":"E","É":"E","Ê":"E","Ë":"E","Ì":"I","Í":"I","Î":"I","Ï":"I","Ð":"D","Ñ":"N","Ò":"O","Ó":"O","Ô":"O","Õ":"O","Ö":"O","Ø":"O","Ù":"U","Ú":"U","Û":"U","Ü":"U","Ý":"Y","Þ":"TH","ß":"ss","à":"a","á":"a","â":"a","ã":"a","ä":"a","å":"a","æ":"ae","ç":"c","è":"e","é":"e","ê":"e","ë":"e","ì":"i","í":"i","î":"i","ï":"i","ð":"d","ñ":"n","ò":"o","ó":"o","ô":"o","õ":"o","ö":"o","ø":"o","ù":"u","ú":"u","û":"u","ü":"u","ý":"y","þ":"th","ÿ":"y","Ā":"A","ā":"a","Ă":"A","ă":"a","Ą":"A","ą":"a","Ć":"C","ć":"c","Č":"C","č":"c","Ď":"D","ď":"d","Đ":"DJ","đ":"dj","Ē":"E","ē":"e","Ė":"E","ė":"e","Ę":"e","ę":"e","Ě":"E","ě":"e","Ğ":"G","ğ":"g","Ģ":"G","ģ":"g","Ĩ":"I","ĩ":"i","Ī":"i","ī":"i","Į":"I","į":"i","İ":"I","ı":"i","Ķ":"k","ķ":"k","Ļ":"L","ļ":"l","Ľ":"L","ľ":"l","Ł":"L","ł":"l","Ń":"N","ń":"n","Ņ":"N","ņ":"n","Ň":"N","ň":"n","Ō":"O","ō":"o","Ő":"O","ő":"o","Œ":"OE","œ":"oe","Ŕ":"R","ŕ":"r","Ř":"R","ř":"r","Ś":"S","ś":"s","Ş":"S","ş":"s","Š":"S","š":"s","Ţ":"T","ţ":"t","Ť":"T","ť":"t","Ũ":"U","ũ":"u","Ū":"u","ū":"u","Ů":"U","ů":"u","Ű":"U","ű":"u","Ų":"U","ų":"u","Ŵ":"W","ŵ":"w","Ŷ":"Y","ŷ":"y","Ÿ":"Y","Ź":"Z","ź":"z","Ż":"Z","ż":"z","Ž":"Z","ž":"z","Ə":"E","ƒ":"f","Ơ":"O","ơ":"o","Ư":"U","ư":"u","ǈ":"LJ","ǉ":"lj","ǋ":"NJ","ǌ":"nj","Ș":"S","ș":"s","Ț":"T","ț":"t","ə":"e","˚":"o","Ά":"A","Έ":"E","Ή":"H","Ί":"I","Ό":"O","Ύ":"Y","Ώ":"W","ΐ":"i","Α":"A","Β":"B","Γ":"G","Δ":"D","Ε":"E","Ζ":"Z","Η":"H","Θ":"8","Ι":"I","Κ":"K","Λ":"L","Μ":"M","Ν":"N","Ξ":"3","Ο":"O","Π":"P","Ρ":"R","Σ":"S","Τ":"T","Υ":"Y","Φ":"F","Χ":"X","Ψ":"PS","Ω":"W","Ϊ":"I","Ϋ":"Y","ά":"a","έ":"e","ή":"h","ί":"i","ΰ":"y","α":"a","β":"b","γ":"g","δ":"d","ε":"e","ζ":"z","η":"h","θ":"8","ι":"i","κ":"k","λ":"l","μ":"m","ν":"n","ξ":"3","ο":"o","π":"p","ρ":"r","ς":"s","σ":"s","τ":"t","υ":"y","φ":"f","χ":"x","ψ":"ps","ω":"w","ϊ":"i","ϋ":"y","ό":"o","ύ":"y","ώ":"w","Ё":"Yo","Ђ":"DJ","Є":"Ye","І":"I","Ї":"Yi","Ј":"J","Љ":"LJ","Њ":"NJ","Ћ":"C","Џ":"DZ","А":"A","Б":"B","В":"V","Г":"G","Д":"D","Е":"E","Ж":"Zh","З":"Z","И":"I","Й":"J","К":"K","Л":"L","М":"M","Н":"N","О":"O","П":"P","Р":"R","С":"S","Т":"T","У":"U","Ф":"F","Х":"H","Ц":"C","Ч":"Ch","Ш":"Sh","Щ":"Sh","Ъ":"U","Ы":"Y","Ь":"","Э":"E","Ю":"Yu","Я":"Ya","а":"a","б":"b","в":"v","г":"g","д":"d","е":"e","ж":"zh","з":"z","и":"i","й":"j","к":"k","л":"l","м":"m","н":"n","о":"o","п":"p","р":"r","с":"s","т":"t","у":"u","ф":"f","х":"h","ц":"c","ч":"ch","ш":"sh","щ":"sh","ъ":"u","ы":"y","ь":"","э":"e","ю":"yu","я":"ya","ё":"yo","ђ":"dj","є":"ye","і":"i","ї":"yi","ј":"j","љ":"lj","њ":"nj","ћ":"c","ѝ":"u","џ":"dz","Ґ":"G","ґ":"g","Ғ":"GH","ғ":"gh","Қ":"KH","қ":"kh","Ң":"NG","ң":"ng","Ү":"UE","ү":"ue","Ұ":"U","ұ":"u","Һ":"H","һ":"h","Ә":"AE","ә":"ae","Ө":"OE","ө":"oe","Ա":"A","Բ":"B","Գ":"G","Դ":"D","Ե":"E","Զ":"Z","Է":"E\'","Ը":"Y\'","Թ":"T\'","Ժ":"JH","Ի":"I","Լ":"L","Խ":"X","Ծ":"C\'","Կ":"K","Հ":"H","Ձ":"D\'","Ղ":"GH","Ճ":"TW","Մ":"M","Յ":"Y","Ն":"N","Շ":"SH","Չ":"CH","Պ":"P","Ջ":"J","Ռ":"R\'","Ս":"S","Վ":"V","Տ":"T","Ր":"R","Ց":"C","Փ":"P\'","Ք":"Q\'","Օ":"O\'\'","Ֆ":"F","և":"EV","ء":"a","آ":"aa","أ":"a","ؤ":"u","إ":"i","ئ":"e","ا":"a","ب":"b","ة":"h","ت":"t","ث":"th","ج":"j","ح":"h","خ":"kh","د":"d","ذ":"th","ر":"r","ز":"z","س":"s","ش":"sh","ص":"s","ض":"dh","ط":"t","ظ":"z","ع":"a","غ":"gh","ف":"f","ق":"q","ك":"k","ل":"l","م":"m","ن":"n","ه":"h","و":"w","ى":"a","ي":"y","ً":"an","ٌ":"on","ٍ":"en","َ":"a","ُ":"u","ِ":"e","ْ":"","٠":"0","١":"1","٢":"2","٣":"3","٤":"4","٥":"5","٦":"6","٧":"7","٨":"8","٩":"9","پ":"p","چ":"ch","ژ":"zh","ک":"k","گ":"g","ی":"y","۰":"0","۱":"1","۲":"2","۳":"3","۴":"4","۵":"5","۶":"6","۷":"7","۸":"8","۹":"9","฿":"baht","ა":"a","ბ":"b","გ":"g","დ":"d","ე":"e","ვ":"v","ზ":"z","თ":"t","ი":"i","კ":"k","ლ":"l","მ":"m","ნ":"n","ო":"o","პ":"p","ჟ":"zh","რ":"r","ს":"s","ტ":"t","უ":"u","ფ":"f","ქ":"k","ღ":"gh","ყ":"q","შ":"sh","ჩ":"ch","ც":"ts","ძ":"dz","წ":"ts","ჭ":"ch","ხ":"kh","ჯ":"j","ჰ":"h","Ṣ":"S","ṣ":"s","Ẁ":"W","ẁ":"w","Ẃ":"W","ẃ":"w","Ẅ":"W","ẅ":"w","ẞ":"SS","Ạ":"A","ạ":"a","Ả":"A","ả":"a","Ấ":"A","ấ":"a","Ầ":"A","ầ":"a","Ẩ":"A","ẩ":"a","Ẫ":"A","ẫ":"a","Ậ":"A","ậ":"a","Ắ":"A","ắ":"a","Ằ":"A","ằ":"a","Ẳ":"A","ẳ":"a","Ẵ":"A","ẵ":"a","Ặ":"A","ặ":"a","Ẹ":"E","ẹ":"e","Ẻ":"E","ẻ":"e","Ẽ":"E","ẽ":"e","Ế":"E","ế":"e","Ề":"E","ề":"e","Ể":"E","ể":"e","Ễ":"E","ễ":"e","Ệ":"E","ệ":"e","Ỉ":"I","ỉ":"i","Ị":"I","ị":"i","Ọ":"O","ọ":"o","Ỏ":"O","ỏ":"o","Ố":"O","ố":"o","Ồ":"O","ồ":"o","Ổ":"O","ổ":"o","Ỗ":"O","ỗ":"o","Ộ":"O","ộ":"o","Ớ":"O","ớ":"o","Ờ":"O","ờ":"o","Ở":"O","ở":"o","Ỡ":"O","ỡ":"o","Ợ":"O","ợ":"o","Ụ":"U","ụ":"u","Ủ":"U","ủ":"u","Ứ":"U","ứ":"u","Ừ":"U","ừ":"u","Ử":"U","ử":"u","Ữ":"U","ữ":"u","Ự":"U","ự":"u","Ỳ":"Y","ỳ":"y","Ỵ":"Y","ỵ":"y","Ỷ":"Y","ỷ":"y","Ỹ":"Y","ỹ":"y","–":"-","‘":"\'","’":"\'","“":"\\\"","”":"\\\"","„":"\\\"","†":"+","•":"*","…":"...","₠":"ecu","₢":"cruzeiro","₣":"french franc","₤":"lira","₥":"mill","₦":"naira","₧":"peseta","₨":"rupee","₩":"won","₪":"new shequel","₫":"dong","€":"euro","₭":"kip","₮":"tugrik","₯":"drachma","₰":"penny","₱":"peso","₲":"guarani","₳":"austral","₴":"hryvnia","₵":"cedi","₸":"kazakhstani tenge","₹":"indian rupee","₺":"turkish lira","₽":"russian ruble","₿":"bitcoin","℠":"sm","™":"tm","∂":"d","∆":"delta","∑":"sum","∞":"infinity","♥":"love","元":"yuan","円":"yen","﷼":"rial","ﻵ":"laa","ﻷ":"laa","ﻹ":"lai","ﻻ":"la"}');
	  var locales = JSON.parse('{"bg":{"Й":"Y","Ц":"Ts","Щ":"Sht","Ъ":"A","Ь":"Y","й":"y","ц":"ts","щ":"sht","ъ":"a","ь":"y"},"de":{"Ä":"AE","ä":"ae","Ö":"OE","ö":"oe","Ü":"UE","ü":"ue","ß":"ss","%":"prozent","&":"und","|":"oder","∑":"summe","∞":"unendlich","♥":"liebe"},"es":{"%":"por ciento","&":"y","<":"menor que",">":"mayor que","|":"o","¢":"centavos","£":"libras","¤":"moneda","₣":"francos","∑":"suma","∞":"infinito","♥":"amor"},"fr":{"%":"pourcent","&":"et","<":"plus petit",">":"plus grand","|":"ou","¢":"centime","£":"livre","¤":"devise","₣":"franc","∑":"somme","∞":"infini","♥":"amour"},"pt":{"%":"porcento","&":"e","<":"menor",">":"maior","|":"ou","¢":"centavo","∑":"soma","£":"libra","∞":"infinito","♥":"amor"},"uk":{"И":"Y","и":"y","Й":"Y","й":"y","Ц":"Ts","ц":"ts","Х":"Kh","х":"kh","Щ":"Shch","щ":"shch","Г":"H","г":"h"},"vi":{"Đ":"D","đ":"d"},"da":{"Ø":"OE","ø":"oe","Å":"AA","å":"aa","%":"procent","&":"og","|":"eller","$":"dollar","<":"mindre end",">":"større end"},"nb":{"&":"og","Å":"AA","Æ":"AE","Ø":"OE","å":"aa","æ":"ae","ø":"oe"},"it":{"&":"e"},"nl":{"&":"en"},"sv":{"&":"och","Å":"AA","Ä":"AE","Ö":"OE","å":"aa","ä":"ae","ö":"oe"}}');

	  function replace (string, options) {
	    if (typeof string !== 'string') {
	      throw new Error('slugify: string argument expected')
	    }

	    options = (typeof options === 'string')
	      ? {replacement: options}
	      : options || {};

	    var locale = locales[options.locale] || {};

	    var replacement = options.replacement === undefined ? '-' : options.replacement;

	    var trim = options.trim === undefined ? true : options.trim;

	    var slug = string.normalize().split('')
	      // replace characters based on charMap
	      .reduce(function (result, ch) {
	        var appendChar = locale[ch] || charMap[ch] || ch;
	        if (appendChar === replacement) {
	          appendChar = ' ';
	        }
	        return result + appendChar
	          // remove not allowed characters
	          .replace(options.remove || /[^\w\s$*_+~.()'"!\-:@]+/g, '')
	      }, '');

	    if (options.strict) {
	      slug = slug.replace(/[^A-Za-z0-9\s]/g, '');
	    }

	    if (trim) {
	      slug = slug.trim();
	    }

	    // Replace spaces with replacement character, treating multiple consecutive
	    // spaces as a single space.
	    slug = slug.replace(/\s+/g, replacement);

	    if (options.lower) {
	      slug = slug.toLowerCase();
	    }

	    return slug
	  }

	  replace.extend = function (customMap) {
	    Object.assign(charMap, customMap);
	  };

	  return replace
	}));
} (slugify));

var Slugify = slugify.exports;

var inArray=function(a,b){var c=0;if(Array.prototype.indexOf)return 0<=a.indexOf(b,0);for(var d=a.length;c<d;c++)if(c in a&&a[c]===b)return !0;return !1},findKeyInObject=function(a,b){if(b&&a)for(var c in a)if(a.hasOwnProperty(c)&&c.toLowerCase()===b.toLowerCase())return c;return null},isObject=function(a){var b=Object.prototype.toString.call(a);return "[object Object]"===b||"[object Error]"===b},parseNumber=function(a){if(isNaN(a)||!isFinite(a))return 0;var b=parseFloat(a);return isNaN(b)?0:b},returnConvertedBoolean=function(a){return "false"!==a&&"0"!==a&&!!a},decoded=function(a){return decodeURIComponent(a.replace(/\+/g," "))},converted=function(a){return 0===a.indexOf("\"")&&(a=a.slice(1,-1).replace(/\\"/g,"\"").replace(/\\\\/g,"\\")),a};

var Validators={isValidAttributeValue:function isValidAttributeValue(a){return a!==void 0&&!isObject(a)&&!Array.isArray(a)},// Neither null nor undefined can be a valid Key
isValidKeyValue:function isValidKeyValue(a){return !(!a||isObject(a)||Array.isArray(a)||this.isFunction(a))},isStringOrNumber:function isStringOrNumber(a){return "string"==typeof a||"number"==typeof a},isNumber:function isNumber(a){return "number"==typeof a},isFunction:function isFunction(a){return "function"==typeof a},validateIdentities:function validateIdentities(a,b){var c={userIdentities:1,onUserAlias:1,copyUserAttributes:1};if(a){if("modify"===b&&(isObject(a.userIdentities)&&!Object.keys(a.userIdentities).length||!isObject(a.userIdentities)))return {valid:!1,error:Constants.Messages.ValidationMessages.ModifyIdentityRequestUserIdentitiesPresent};for(var d in a)if(a.hasOwnProperty(d)){if(!c[d])return {valid:!1,error:Constants.Messages.ValidationMessages.IdentityRequesetInvalidKey};if("onUserAlias"===d&&!Validators.isFunction(a[d]))return {valid:!1,error:Constants.Messages.ValidationMessages.OnUserAliasType}}if(0===Object.keys(a).length)return {valid:!0};// identityApiData.userIdentities can't be undefined
if(void 0===a.userIdentities)return {valid:!1,error:Constants.Messages.ValidationMessages.UserIdentities};// identityApiData.userIdentities can be null, but if it isn't null or undefined (above conditional), it must be an object
if(null!==a.userIdentities&&!isObject(a.userIdentities))return {valid:!1,error:Constants.Messages.ValidationMessages.UserIdentities};if(isObject(a.userIdentities)&&Object.keys(a.userIdentities).length)for(var e in a.userIdentities)if(a.userIdentities.hasOwnProperty(e)){if(!1===Types.IdentityType.getIdentityType(e))return {valid:!1,error:Constants.Messages.ValidationMessages.UserIdentitiesInvalidKey};if("string"!=typeof a.userIdentities[e]&&null!==a.userIdentities[e])return {valid:!1,error:Constants.Messages.ValidationMessages.UserIdentitiesInvalidValues}}}return {valid:!0}}};

var StorageNames$2=Constants.StorageNames;function Helpers(a){function b(b){var a;return window.crypto&&window.crypto.getRandomValues&&(a=window.crypto.getRandomValues(new Uint8Array(1))),a?(b^a[0]%16>>b/4).toString(16):(b^16*Math.random()>>b/4).toString(16)}var c=this;/**
     * Returns a value between 1-100 inclusive.
     */ // Standalone version of jQuery.extend, from https://github.com/dansdom/extend
// Utility Functions
// Imported Validators
this.canLog=function(){return !!(a._Store.isEnabled&&(a._Store.devToken||a._Store.webviewBridgeEnabled))},this.getFeatureFlag=function(b){return a._Store.SDKConfig.flags.hasOwnProperty(b)?a._Store.SDKConfig.flags[b]:null},this.getRampNumber=function(a){if(!a)return 100;var b=c.generateHash(a);return Math.abs(b%100)+1},this.invokeCallback=function(b,d,e,f,g){b||a.Logger.warning("There is no callback provided");try{c.Validators.isFunction(b)&&b({httpCode:d,body:e,getUser:function getUser(){return f?f:a.Identity.getCurrentUser()},getPreviousUser:function getPreviousUser(){if(!g){var b=a.Identity.getUsers(),c=b.shift(),d=f||a.Identity.getCurrentUser();return c&&d&&c.getMPID()===d.getMPID()&&(c=b.shift()),c||null}return a.Identity.getUser(g)}});}catch(b){a.Logger.error("There was an error with your callback: "+b);}},this.invokeAliasCallback=function(b,d,e){b||a.Logger.warning("There is no callback provided");try{if(c.Validators.isFunction(b)){var f={httpCode:d};e&&(f.message=e),b(f);}}catch(b){a.Logger.error("There was an error with your callback: "+b);}},this.extend=function(){var a,b,d,e,f,g,h=arguments[0]||{},j=1,k=arguments.length,l=!1,// helper which replicates the jquery internal functions
m={hasOwn:Object.prototype.hasOwnProperty,class2type:{},type:function type(a){return null==a?a+"":m.class2type[Object.prototype.toString.call(a)]||"object"},isPlainObject:function isPlainObject(a){if(!a||"object"!==m.type(a)||a.nodeType||m.isWindow(a))return !1;try{if(a.constructor&&!m.hasOwn.call(a,"constructor")&&!m.hasOwn.call(a.constructor.prototype,"isPrototypeOf"))return !1}catch(a){return !1}for(var b in a);// eslint-disable-line no-empty
return b===void 0||m.hasOwn.call(a,b)},isArray:Array.isArray||function(a){return "array"===m.type(a)},isFunction:function isFunction(a){return "function"===m.type(a)},isWindow:function isWindow(a){return null!=a&&a==a.window}};// end of objectHelper
// Handle a deep copy situation
for("boolean"==typeof h&&(l=h,h=arguments[1]||{},j=2),"object"===_typeof(h)||m.isFunction(h)||(h={}),k===j&&(h=this,--j);j<k;j++)// Only deal with non-null/undefined values
if(null!=(a=arguments[j]))// Extend the base object
for(b in a)// Prevent never-ending loop
(d=h[b],e=a[b],h!==e)&&(l&&e&&(m.isPlainObject(e)||(f=m.isArray(e)))?(f?(f=!1,g=d&&m.isArray(d)?d:[]):g=d&&m.isPlainObject(d)?d:{},h[b]=c.extend(l,g,e)):void 0!==e&&(h[b]=e));// Recurse if we're merging plain objects or arrays
// Return the modified object
return h},this.createServiceUrl=function(b,c){var d,e=window.mParticle&&a._Store.SDKConfig.forceHttps?"https://":window.location.protocol+"//";return d=a._Store.SDKConfig.forceHttps?"https://"+b:e+b,c&&(d+=c),d},this.createXHR=function(b){var c;try{c=new window.XMLHttpRequest;}catch(b){a.Logger.error("Error creating XMLHttpRequest object.");}if(c&&b&&"withCredentials"in c)c.onreadystatechange=b;else if("undefined"!=typeof window.XDomainRequest){a.Logger.verbose("Creating XDomainRequest object");try{c=new window.XDomainRequest,c.onload=b;}catch(b){a.Logger.error("Error creating XDomainRequest object");}}return c},this.generateUniqueId=function(d){// https://gist.github.com/jed/982883
// Added support for crypto for better random
return d// if the placeholder was passed, return
?b(d)// a random number
:// or otherwise a concatenated string:
"10000000-1000-4000-8000-100000000000"// -100000000000,
.replace(// replacing
/[018]/g,// zeroes, ones, and eights with
c.generateUniqueId// random hex digits
)},this.filterUserIdentities=function(a,b){var d=[];if(a&&Object.keys(a).length)for(var e in a)if(a.hasOwnProperty(e)){var f=Types.IdentityType.getIdentityType(e);if(!c.inArray(b,f)){var g={Type:f,Identity:a[e]};f===Types.IdentityType.CustomerId?d.unshift(g):d.push(g);}}return d},this.filterUserIdentitiesForForwarders=function(a,b){var d={};if(a&&Object.keys(a).length)for(var e in a)if(a.hasOwnProperty(e)){var f=Types.IdentityType.getIdentityType(e);c.inArray(b,f)||(d[e]=a[e]);}return d},this.filterUserAttributes=function(a,b){var d={};if(a&&Object.keys(a).length)for(var e in a)if(a.hasOwnProperty(e)){var f=c.generateHash(e);c.inArray(b,f)||(d[e]=a[e]);}return d},this.isEventType=function(a){for(var b in Types.EventType)if(Types.EventType.hasOwnProperty(b)&&Types.EventType[b]===a)return !0;return !1},this.parseStringOrNumber=function(a){return Validators.isStringOrNumber(a)?a:null},this.generateHash=function(a){var b,c=0,d=0;if(void 0===a||null===a)return 0;if(a=a.toString().toLowerCase(),Array.prototype.reduce)return a.split("").reduce(function(c,d){return c=(c<<5)-c+d.charCodeAt(0),c&c},0);if(0===a.length)return c;for(d=0;d<a.length;d++)b=a.charCodeAt(d),c=(c<<5)-c+b,c&=c;return c},this.sanitizeAttributes=function(b,d){if(!b||!c.isObject(b))return null;var e={};for(var f in b)// Make sure that attribute values are not objects or arrays, which are not valid
b.hasOwnProperty(f)&&c.Validators.isValidAttributeValue(b[f])?e[f]=b[f]:a.Logger.warning("For '"+d+"', the corresponding attribute value of '"+f+"' must be a string, number, boolean, or null.");return e},this.isDelayedByIntegration=function(b,c,d){if(d-c>a._Store.SDKConfig.integrationDelayTimeout)return !1;for(var e in b){if(!0===b[e])return !0;continue}return !1},this.createMainStorageName=function(a){return a?StorageNames$2.currentStorageName+"_"+a:StorageNames$2.currentStorageName},this.createProductStorageName=function(a){return a?StorageNames$2.currentStorageProductsName+"_"+a:StorageNames$2.currentStorageProductsName},this.isSlug=function(a){return a===Slugify(a)},this.converted=converted,this.findKeyInObject=findKeyInObject,this.parseNumber=parseNumber,this.inArray=inArray,this.isObject=isObject,this.decoded=decoded,this.returnConvertedBoolean=returnConvertedBoolean,this.Validators=Validators;}

var Messages$8=Constants.Messages,androidBridgeNameBase="mParticleAndroid",iosBridgeNameBase="mParticle";function NativeSdkHelpers(a){var b=this;this.isBridgeV2Available=function(a){if(!a)return !1;var b=iosBridgeNameBase+"_"+a+"_v2";// iOS v2 bridge
return !!(window.webkit&&window.webkit.messageHandlers&&window.webkit.messageHandlers.hasOwnProperty(b))||!!(window.mParticle&&window.mParticle.uiwebviewBridgeName&&window.mParticle.uiwebviewBridgeName===b)||!!window.hasOwnProperty(androidBridgeNameBase+"_"+a+"_v2");// other iOS v2 bridge
// TODO: what to do about people setting things on mParticle itself?
// android
},this.isWebviewEnabled=function(c,d){return a._Store.bridgeV2Available=b.isBridgeV2Available(c),a._Store.bridgeV1Available=b.isBridgeV1Available(),2===d?a._Store.bridgeV2Available:!(window.mParticle&&window.mParticle.uiwebviewBridgeName&&window.mParticle.uiwebviewBridgeName!==iosBridgeNameBase+"_"+c+"_v2")&&!!(2>d)&&(a._Store.bridgeV2Available||a._Store.bridgeV1Available);// iOS BridgeV1 can be available via mParticle.isIOS, but return false if uiwebviewBridgeName doesn't match requiredWebviewBridgeName
},this.isBridgeV1Available=function(){return !!(a._Store.SDKConfig.useNativeSdk||window.mParticleAndroid||a._Store.SDKConfig.isIOS)},this.sendToNative=function(c,d){return a._Store.bridgeV2Available&&2===a._Store.SDKConfig.minWebviewBridgeVersion?void b.sendViaBridgeV2(c,d,a._Store.SDKConfig.requiredWebviewBridgeName):a._Store.bridgeV2Available&&2>a._Store.SDKConfig.minWebviewBridgeVersion?void b.sendViaBridgeV2(c,d,a._Store.SDKConfig.requiredWebviewBridgeName):a._Store.bridgeV1Available&&2>a._Store.SDKConfig.minWebviewBridgeVersion?void b.sendViaBridgeV1(c,d):void 0},this.sendViaBridgeV1=function(c,d){window.mParticleAndroid&&window.mParticleAndroid.hasOwnProperty(c)?(a.Logger.verbose(Messages$8.InformationMessages.SendAndroid+c),window.mParticleAndroid[c](d)):a._Store.SDKConfig.isIOS&&(a.Logger.verbose(Messages$8.InformationMessages.SendIOS+c),b.sendViaIframeToIOS(c,d));},this.sendViaIframeToIOS=function(a,b){var c=document.createElement("IFRAME");c.setAttribute("src","mp-sdk://"+a+"/"+encodeURIComponent(b)),document.documentElement.appendChild(c),c.parentNode.removeChild(c);},this.sendViaBridgeV2=function(c,d,e){if(e){var f,g,h=window[androidBridgeNameBase+"_"+e+"_v2"],i=iosBridgeNameBase+"_"+e+"_v2";return window.webkit&&window.webkit.messageHandlers&&window.webkit.messageHandlers[i]&&(f=window.webkit.messageHandlers[i]),a.uiwebviewBridgeName===i&&(g=a[i]),h&&h.hasOwnProperty(c)?(a.Logger.verbose(Messages$8.InformationMessages.SendAndroid+c),void h[c](d)):void(f?(a.Logger.verbose(Messages$8.InformationMessages.SendIOS+c),f.postMessage(JSON.stringify({path:c,value:d?JSON.parse(d):null}))):g&&(a.Logger.verbose(Messages$8.InformationMessages.SendIOS+c),b.sendViaIframeToIOS(c,d)))}};}

var Messages$7=Constants.Messages;function cookieSyncManager(a){var b=this;this.attemptCookieSync=function(c,d,e){var f,g,h,i,j,k;d&&!a._Store.webviewBridgeEnabled&&a._Store.pixelConfigurations.forEach(function(l){k=!1,l.filteringConsentRuleValues&&l.filteringConsentRuleValues.values&&l.filteringConsentRuleValues.values.length&&(k=!0),f={moduleId:l.moduleId,frequencyCap:l.frequencyCap,pixelUrl:b.replaceAmp(l.pixelUrl),redirectUrl:l.redirectUrl?b.replaceAmp(l.redirectUrl):null,filteringConsentRuleValues:l.filteringConsentRuleValues},h=b.replaceMPID(f.pixelUrl,d),i=f.redirectUrl?b.replaceMPID(f.redirectUrl,d):"",j=h+encodeURIComponent(i);var m=a._Persistence.getPersistence();return c&&c!==d?void(m&&m[d]&&(!m[d].csd&&(m[d].csd={}),b.performCookieSync(j,f.moduleId,d,m[d].csd,f.filteringConsentRuleValues,e,k))):void(m[d]&&(!m[d].csd&&(m[d].csd={}),g=m[d].csd[f.moduleId.toString()]?m[d].csd[f.moduleId.toString()]:null,g?new Date().getTime()>new Date(g).getTime()+24*(60*(1e3*(60*f.frequencyCap)))&&b.performCookieSync(j,f.moduleId,d,m[d].csd,f.filteringConsentRuleValues,e,k):b.performCookieSync(j,f.moduleId,d,m[d].csd,f.filteringConsentRuleValues,e,k)))});},this.replaceMPID=function(a,b){return a.replace("%%mpid%%",b)},this.replaceAmp=function(a){return a.replace(/&amp;/g,"&")},this.performCookieSync=function(b,c,d,e,f,g,h){// if MPID is new to cookies, we should not try to perform the cookie sync
// because a cookie sync can only occur once a user either consents or doesn't
// we should not check if its enabled if the user has a blank consent
if(!(h&&g)&&a._Consent.isEnabledForUserConsent(f,a.Identity.getCurrentUser())){var i=document.createElement("img");a.Logger.verbose(Messages$7.InformationMessages.CookieSync),i.onload=function(){e[c.toString()]=new Date().getTime(),a._Persistence.saveUserCookieSyncDatesToPersistence(d,e);},i.src=b;}};}

var Messages$6=Constants.Messages;function SessionManager(a){var b=this;this.initialize=function(){if(a._Store.sessionId){var c=6e4*a._Store.SDKConfig.sessionTimeout;if(new Date>new Date(a._Store.dateLastEventSent.getTime()+c))b.endSession(),b.startNewSession();else {var d=a._Persistence.getPersistence();d&&!d.cu&&(a.Identity.identify(a._Store.SDKConfig.identifyRequest,a._Store.SDKConfig.identityCallback),a._Store.identifyCalled=!0,a._Store.SDKConfig.identityCallback=null);}}else b.startNewSession();},this.getSession=function(){return a._Store.sessionId},this.startNewSession=function(){if(a.Logger.verbose(Messages$6.InformationMessages.StartingNewSession),a._Helpers.canLog()){a._Store.sessionId=a._Helpers.generateUniqueId().toUpperCase();var c=a.Identity.getCurrentUser(),d=c?c.getMPID():null;if(d&&(a._Store.currentSessionMPIDs=[d]),!a._Store.sessionStartDate){var e=new Date;a._Store.sessionStartDate=e,a._Store.dateLastEventSent=e;}b.setSessionTimer(),a._Store.identifyCalled||(a.Identity.identify(a._Store.SDKConfig.identifyRequest,a._Store.SDKConfig.identityCallback),a._Store.identifyCalled=!0,a._Store.SDKConfig.identityCallback=null),a._Events.logEvent({messageType:Types.MessageType.SessionStart});}else a.Logger.verbose(Messages$6.InformationMessages.AbandonStartSession);},this.endSession=function(c){if(a.Logger.verbose(Messages$6.InformationMessages.StartingEndSession),c)a._Events.logEvent({messageType:Types.MessageType.SessionEnd}),a._Store.sessionId=null,a._Store.dateLastEventSent=null,a._Store.sessionAttributes={},a._Persistence.update();else if(a._Helpers.canLog()){var d,e,f;if(e=a._Persistence.getPersistence(),!e)return;if(e.gs&&!e.gs.sid)return void a.Logger.verbose(Messages$6.InformationMessages.NoSessionToEnd);// sessionId is not equal to cookies.sid if cookies.sid is changed in another tab
if(e.gs.sid&&a._Store.sessionId!==e.gs.sid&&(a._Store.sessionId=e.gs.sid),e.gs&&e.gs.les){d=6e4*a._Store.SDKConfig.sessionTimeout;var g=new Date().getTime();f=g-e.gs.les,f<d?b.setSessionTimer():(a._Events.logEvent({messageType:Types.MessageType.SessionEnd}),a._Store.sessionId=null,a._Store.dateLastEventSent=null,a._Store.sessionStartDate=null,a._Store.sessionAttributes={},a._Persistence.update());}}else a.Logger.verbose(Messages$6.InformationMessages.AbandonEndSession);},this.setSessionTimer=function(){var c=6e4*a._Store.SDKConfig.sessionTimeout;a._Store.globalTimer=window.setTimeout(function(){b.endSession();},c);},this.resetSessionTimer=function(){a._Store.webviewBridgeEnabled||(!a._Store.sessionId&&b.startNewSession(),b.clearSessionTimeout(),b.setSessionTimer()),b.startNewSessionIfNeeded();},this.clearSessionTimeout=function(){clearTimeout(a._Store.globalTimer);},this.startNewSessionIfNeeded=function(){if(!a._Store.webviewBridgeEnabled){var c=a._Persistence.getPersistence();!a._Store.sessionId&&c&&(c.sid?a._Store.sessionId=c.sid:b.startNewSession());}};}

var Messages$5=Constants.Messages;function Ecommerce(a){var b=this;// sanitizes any non number, non string value to 0
this.convertTransactionAttributesToProductAction=function(a,b){a.hasOwnProperty("Id")&&(b.TransactionId=a.Id),a.hasOwnProperty("Affiliation")&&(b.Affiliation=a.Affiliation),a.hasOwnProperty("CouponCode")&&(b.CouponCode=a.CouponCode),a.hasOwnProperty("Revenue")&&(b.TotalAmount=this.sanitizeAmount(a.Revenue,"Revenue")),a.hasOwnProperty("Shipping")&&(b.ShippingAmount=this.sanitizeAmount(a.Shipping,"Shipping")),a.hasOwnProperty("Tax")&&(b.TaxAmount=this.sanitizeAmount(a.Tax,"Tax")),a.hasOwnProperty("Step")&&(b.CheckoutStep=a.Step),a.hasOwnProperty("Option")&&(b.CheckoutOptions=a.Option);},this.getProductActionEventName=function(a){switch(a){case Types.ProductActionType.AddToCart:return "AddToCart";case Types.ProductActionType.AddToWishlist:return "AddToWishlist";case Types.ProductActionType.Checkout:return "Checkout";case Types.ProductActionType.CheckoutOption:return "CheckoutOption";case Types.ProductActionType.Click:return "Click";case Types.ProductActionType.Purchase:return "Purchase";case Types.ProductActionType.Refund:return "Refund";case Types.ProductActionType.RemoveFromCart:return "RemoveFromCart";case Types.ProductActionType.RemoveFromWishlist:return "RemoveFromWishlist";case Types.ProductActionType.ViewDetail:return "ViewDetail";case Types.ProductActionType.Unknown:default:return "Unknown";}},this.getPromotionActionEventName=function(a){return a===Types.PromotionActionType.PromotionClick?"PromotionClick":a===Types.PromotionActionType.PromotionView?"PromotionView":"Unknown"},this.convertProductActionToEventType=function(b){return b===Types.ProductActionType.AddToCart?Types.CommerceEventType.ProductAddToCart:b===Types.ProductActionType.AddToWishlist?Types.CommerceEventType.ProductAddToWishlist:b===Types.ProductActionType.Checkout?Types.CommerceEventType.ProductCheckout:b===Types.ProductActionType.CheckoutOption?Types.CommerceEventType.ProductCheckoutOption:b===Types.ProductActionType.Click?Types.CommerceEventType.ProductClick:b===Types.ProductActionType.Purchase?Types.CommerceEventType.ProductPurchase:b===Types.ProductActionType.Refund?Types.CommerceEventType.ProductRefund:b===Types.ProductActionType.RemoveFromCart?Types.CommerceEventType.ProductRemoveFromCart:b===Types.ProductActionType.RemoveFromWishlist?Types.CommerceEventType.ProductRemoveFromWishlist:b===Types.ProductActionType.Unknown?Types.EventType.Unknown:b===Types.ProductActionType.ViewDetail?Types.CommerceEventType.ProductViewDetail:(a.Logger.error("Could not convert product action type "+b+" to event type"),null)},this.convertPromotionActionToEventType=function(b){return b===Types.PromotionActionType.PromotionClick?Types.CommerceEventType.PromotionClick:b===Types.PromotionActionType.PromotionView?Types.CommerceEventType.PromotionView:(a.Logger.error("Could not convert promotion action type "+b+" to event type"),null)},this.generateExpandedEcommerceName=function(a,b){return "eCommerce - "+a+" - "+(b?"Total":"Item")},this.extractProductAttributes=function(a,b){b.CouponCode&&(a["Coupon Code"]=b.CouponCode),b.Brand&&(a.Brand=b.Brand),b.Category&&(a.Category=b.Category),b.Name&&(a.Name=b.Name),b.Sku&&(a.Id=b.Sku),b.Price&&(a["Item Price"]=b.Price),b.Quantity&&(a.Quantity=b.Quantity),b.Position&&(a.Position=b.Position),b.Variant&&(a.Variant=b.Variant),a["Total Product Amount"]=b.TotalAmount||0;},this.extractTransactionId=function(a,b){b.TransactionId&&(a["Transaction Id"]=b.TransactionId);},this.extractActionAttributes=function(a,c){b.extractTransactionId(a,c),c.Affiliation&&(a.Affiliation=c.Affiliation),c.CouponCode&&(a["Coupon Code"]=c.CouponCode),c.TotalAmount&&(a["Total Amount"]=c.TotalAmount),c.ShippingAmount&&(a["Shipping Amount"]=c.ShippingAmount),c.TaxAmount&&(a["Tax Amount"]=c.TaxAmount),c.CheckoutOptions&&(a["Checkout Options"]=c.CheckoutOptions),c.CheckoutStep&&(a["Checkout Step"]=c.CheckoutStep);},this.extractPromotionAttributes=function(a,b){b.Id&&(a.Id=b.Id),b.Creative&&(a.Creative=b.Creative),b.Name&&(a.Name=b.Name),b.Position&&(a.Position=b.Position);},this.buildProductList=function(a,b){return b?Array.isArray(b)?b:[b]:a.ShoppingCart.ProductList},this.createProduct=function(b,c,d,e,f,g,h,i,j,k){return (k=a._Helpers.sanitizeAttributes(k,b),"string"!=typeof b)?(a.Logger.error("Name is required when creating a product"),null):a._Helpers.Validators.isStringOrNumber(c)?a._Helpers.Validators.isStringOrNumber(d)?(d=a._Helpers.parseNumber(d),i&&!a._Helpers.Validators.isNumber(i)&&(a.Logger.error("Position must be a number, it will be set to null."),i=null),e=a._Helpers.Validators.isStringOrNumber(e)?a._Helpers.parseNumber(e):1,{Name:b,Sku:c,Price:d,Quantity:e,Brand:h,Variant:f,Category:g,Position:i,CouponCode:j,TotalAmount:e*d,Attributes:k}):(a.Logger.error("Price is required when creating a product, and must be a string or a number"),null):(a.Logger.error("SKU is required when creating a product, and must be a string or a number"),null)},this.createPromotion=function(b,c,d,e){return a._Helpers.Validators.isStringOrNumber(b)?{Id:b,Creative:c,Name:d,Position:e}:(a.Logger.error(Messages$5.ErrorMessages.PromotionIdRequired),null)},this.createImpression=function(b,c){return "string"==typeof b?c?{Name:b,Product:c}:(a.Logger.error("Product is required when creating an impression."),null):(a.Logger.error("Name is required when creating an impression."),null)},this.createTransactionAttributes=function(b,c,d,e,f,g){return a._Helpers.Validators.isStringOrNumber(b)?{Id:b,Affiliation:c,CouponCode:d,Revenue:e,Shipping:f,Tax:g}:(a.Logger.error(Messages$5.ErrorMessages.TransactionIdRequired),null)},this.expandProductImpression=function(c){var d=[];return c.ProductImpressions?(c.ProductImpressions.forEach(function(e){e.ProductList&&e.ProductList.forEach(function(f){var g=a._Helpers.extend(!1,{},c.EventAttributes);if(f.Attributes)for(var h in f.Attributes)g[h]=f.Attributes[h];b.extractProductAttributes(g,f),e.ProductImpressionList&&(g["Product Impression List"]=e.ProductImpressionList);var i=a._ServerModel.createEventObject({messageType:Types.MessageType.PageEvent,name:b.generateExpandedEcommerceName("Impression"),data:g,eventType:Types.EventType.Transaction});d.push(i);});}),d):d},this.expandCommerceEvent=function(a){return a?b.expandProductAction(a).concat(b.expandPromotionAction(a)).concat(b.expandProductImpression(a)):null},this.expandPromotionAction=function(c){var d=[];if(!c.PromotionAction)return d;var e=c.PromotionAction.PromotionList;return e.forEach(function(e){var f=a._Helpers.extend(!1,{},c.EventAttributes);b.extractPromotionAttributes(f,e);var g=a._ServerModel.createEventObject({messageType:Types.MessageType.PageEvent,name:b.generateExpandedEcommerceName(Types.PromotionActionType.getExpansionName(c.PromotionAction.PromotionActionType)),data:f,eventType:Types.EventType.Transaction});d.push(g);}),d},this.expandProductAction=function(c){var d=[];if(!c.ProductAction)return d;var e=!1;if(c.ProductAction.ProductActionType===Types.ProductActionType.Purchase||c.ProductAction.ProductActionType===Types.ProductActionType.Refund){var f=a._Helpers.extend(!1,{},c.EventAttributes);f["Product Count"]=c.ProductAction.ProductList?c.ProductAction.ProductList.length:0,b.extractActionAttributes(f,c.ProductAction),c.CurrencyCode&&(f["Currency Code"]=c.CurrencyCode);var g=a._ServerModel.createEventObject({messageType:Types.MessageType.PageEvent,name:b.generateExpandedEcommerceName(Types.ProductActionType.getExpansionName(c.ProductAction.ProductActionType),!0),data:f,eventType:Types.EventType.Transaction});d.push(g);}else e=!0;var h=c.ProductAction.ProductList;return h?(h.forEach(function(f){var g=a._Helpers.extend(!1,c.EventAttributes,f.Attributes);e?b.extractActionAttributes(g,c.ProductAction):b.extractTransactionId(g,c.ProductAction),b.extractProductAttributes(g,f);var h=a._ServerModel.createEventObject({messageType:Types.MessageType.PageEvent,name:b.generateExpandedEcommerceName(Types.ProductActionType.getExpansionName(c.ProductAction.ProductActionType)),data:g,eventType:Types.EventType.Transaction});d.push(h);}),d):d},this.createCommerceEventObject=function(b){var c;return (a.Logger.verbose(Messages$5.InformationMessages.StartingLogCommerceEvent),a._Helpers.canLog())?(c=a._ServerModel.createEventObject({messageType:Types.MessageType.Commerce}),c.EventName="eCommerce - ",c.CurrencyCode=a._Store.currencyCode,c.ShoppingCart=[],c.CustomFlags=b,c):(a.Logger.verbose(Messages$5.InformationMessages.AbandonLogEvent),null)},this.sanitizeAmount=function(b,c){if(!a._Helpers.Validators.isStringOrNumber(b)){var d=[c,"must be of type number. A",_typeof(b),"was passed. Converting to 0"].join(" ");return a.Logger.warning(d),0}// if amount is a string, it will be parsed into a number if possible, or set to 0
return a._Helpers.parseNumber(b)};}

function createSDKConfig(a){var b={};for(var c in Constants.DefaultConfig)Constants.DefaultConfig.hasOwnProperty(c)&&(b[c]=Constants.DefaultConfig[c]);if(a)for(c in a)a.hasOwnProperty(c)&&(b[c]=a[c]);for(c in Constants.DefaultUrls)b[c]=Constants.DefaultUrls[c];return b}function Store(a,b){var c={isEnabled:!0,sessionAttributes:{},currentSessionMPIDs:[],consentState:null,sessionId:null,isFirstRun:null,clientId:null,deviceId:null,devToken:null,migrationData:{},serverSettings:{},dateLastEventSent:null,sessionStartDate:null,currentPosition:null,isTracking:!1,watchPositionId:null,cartProducts:[],eventQueue:[],currencyCode:null,globalTimer:null,context:"",configurationLoaded:!1,identityCallInFlight:!1,SDKConfig:{},migratingToIDSyncCookies:!1,nonCurrentUserMPIDs:{},identifyCalled:!1,isLoggedIn:!1,cookieSyncDates:{},integrationAttributes:{},requireDelay:!0,isLocalStorageAvailable:null,storageName:null,prodStorageName:null,activeForwarders:[],kits:{},configuredForwarders:[],pixelConfigurations:[]};for(var d in c)this[d]=c[d];// Set configuration to default settings
if(this.integrationDelayTimeoutStart=Date.now(),this.SDKConfig=createSDKConfig(a),a){if(a.deviceId&&(this.deviceId=a.deviceId),this.SDKConfig.isDevelopmentMode=!!a.hasOwnProperty("isDevelopmentMode")&&b._Helpers.returnConvertedBoolean(a.isDevelopmentMode),a.hasOwnProperty("v1SecureServiceUrl")&&(this.SDKConfig.v1SecureServiceUrl=a.v1SecureServiceUrl),a.hasOwnProperty("v2SecureServiceUrl")&&(this.SDKConfig.v2SecureServiceUrl=a.v2SecureServiceUrl),a.hasOwnProperty("v3SecureServiceUrl")&&(this.SDKConfig.v3SecureServiceUrl=a.v3SecureServiceUrl),a.hasOwnProperty("identityUrl")&&(this.SDKConfig.identityUrl=a.identityUrl),a.hasOwnProperty("aliasUrl")&&(this.SDKConfig.aliasUrl=a.aliasUrl),a.hasOwnProperty("configUrl")&&(this.SDKConfig.configUrl=a.configUrl),a.hasOwnProperty("logLevel")&&(this.SDKConfig.logLevel=a.logLevel),this.SDKConfig.useNativeSdk=!!a.hasOwnProperty("useNativeSdk")&&a.useNativeSdk,a.hasOwnProperty("kits")&&(this.SDKConfig.kits=a.kits),this.SDKConfig.isIOS=a.hasOwnProperty("isIOS")?a.isIOS:!!(window.mParticle&&window.mParticle.isIOS)&&window.mParticle.isIOS,this.SDKConfig.useCookieStorage=!!a.hasOwnProperty("useCookieStorage")&&a.useCookieStorage,this.SDKConfig.maxProducts=a.hasOwnProperty("maxProducts")?a.maxProducts:Constants.DefaultConfig.maxProducts,this.SDKConfig.maxCookieSize=a.hasOwnProperty("maxCookieSize")?a.maxCookieSize:Constants.DefaultConfig.maxCookieSize,a.hasOwnProperty("appName")&&(this.SDKConfig.appName=a.appName),a.hasOwnProperty("package")&&(this.SDKConfig["package"]=a["package"]),this.SDKConfig.integrationDelayTimeout=a.hasOwnProperty("integrationDelayTimeout")?a.integrationDelayTimeout:Constants.DefaultConfig.integrationDelayTimeout,a.hasOwnProperty("identifyRequest")&&(this.SDKConfig.identifyRequest=a.identifyRequest),a.hasOwnProperty("identityCallback")){var e=a.identityCallback;b._Helpers.Validators.isFunction(e)?this.SDKConfig.identityCallback=a.identityCallback:b.Logger.warning("The optional callback must be a function. You tried entering a(n) "+_typeof(e)," . Callback not set. Please set your callback again.");}if(a.hasOwnProperty("appVersion")&&(this.SDKConfig.appVersion=a.appVersion),a.hasOwnProperty("appName")&&(this.SDKConfig.appName=a.appName),a.hasOwnProperty("sessionTimeout")&&(this.SDKConfig.sessionTimeout=a.sessionTimeout),a.hasOwnProperty("dataPlan")&&(this.SDKConfig.dataPlan={PlanVersion:null,PlanId:null},a.dataPlan.hasOwnProperty("planId")&&("string"==typeof a.dataPlan.planId?b._Helpers.isSlug(a.dataPlan.planId)?this.SDKConfig.dataPlan.PlanId=a.dataPlan.planId:b.Logger.error("Your data plan id must be in a slug format"):b.Logger.error("Your data plan id must be a string")),a.dataPlan.hasOwnProperty("planVersion")&&("number"==typeof a.dataPlan.planVersion?this.SDKConfig.dataPlan.PlanVersion=a.dataPlan.planVersion:b.Logger.error("Your data plan version must be a number"))),this.SDKConfig.forceHttps=!a.hasOwnProperty("forceHttps")||a.forceHttps,a.hasOwnProperty("customFlags")&&(this.SDKConfig.customFlags=a.customFlags),this.SDKConfig.minWebviewBridgeVersion=a.hasOwnProperty("minWebviewBridgeVersion")?a.minWebviewBridgeVersion:1,this.SDKConfig.aliasMaxWindow=a.hasOwnProperty("aliasMaxWindow")?a.aliasMaxWindow:Constants.DefaultConfig.aliasMaxWindow,a.hasOwnProperty("dataPlanOptions")){var f=a.dataPlanOptions;f.hasOwnProperty("dataPlanVersion")&&f.hasOwnProperty("blockUserAttributes")&&f.hasOwnProperty("blockEventAttributes")&&f.hasOwnProperty("blockEvents")&&f.hasOwnProperty("blockUserIdentities")||b.Logger.error("Ensure your config.dataPlanOptions object has the following keys: a \"dataPlanVersion\" object, and \"blockUserAttributes\", \"blockEventAttributes\", \"blockEvents\", \"blockUserIdentities\" booleans");}a.hasOwnProperty("onCreateBatch")&&("function"==typeof a.onCreateBatch?this.SDKConfig.onCreateBatch=a.onCreateBatch:(b.Logger.error("config.onCreateBatch must be a function"),this.SDKConfig.onCreateBatch=void 0)),a.hasOwnProperty("flags")||(this.SDKConfig.flags={}),this.SDKConfig.flags.hasOwnProperty(Constants.FeatureFlags.EventsV3)||(this.SDKConfig.flags[Constants.FeatureFlags.EventsV3]=0),this.SDKConfig.flags.hasOwnProperty(Constants.FeatureFlags.EventBatchingIntervalMillis)||(this.SDKConfig.flags[Constants.FeatureFlags.EventBatchingIntervalMillis]=Constants.DefaultConfig.uploadInterval),this.SDKConfig.flags.hasOwnProperty(Constants.FeatureFlags.ReportBatching)||(this.SDKConfig.flags[Constants.FeatureFlags.ReportBatching]=!1);}}

function Logger(a){var b=this,c=a.logLevel||"warning";this.logger=a.hasOwnProperty("logger")?a.logger:new ConsoleLogger,this.verbose=function(a){"none"!==c&&b.logger.verbose&&"verbose"===c&&b.logger.verbose(a);},this.warning=function(a){"none"!==c&&b.logger.warning&&("verbose"===c||"warning"===c)&&b.logger.warning(a);},this.error=function(a){"none"!==c&&b.logger.error&&b.logger.error(a);},this.setLogLevel=function(a){c=a;};}function ConsoleLogger(){this.verbose=function(a){console&&console.info&&console.info(a);},this.error=function(a){console&&console.error&&console.error(a);},this.warning=function(a){console&&console.warn&&console.warn(a);};}

var Base64$1=Polyfill.Base64,Messages$4=Constants.Messages,Base64CookieKeys=Constants.Base64CookieKeys,SDKv2NonMPIDCookieKeys=Constants.SDKv2NonMPIDCookieKeys,StorageNames$1=Constants.StorageNames;function _Persistence(a){function b(b){var c=a._Store;return b.gs.sid=c.sessionId,b.gs.ie=c.isEnabled,b.gs.sa=c.sessionAttributes,b.gs.ss=c.serverSettings,b.gs.dt=c.devToken,b.gs.les=c.dateLastEventSent?c.dateLastEventSent.getTime():null,b.gs.av=c.SDKConfig.appVersion,b.gs.cgid=c.clientId,b.gs.das=c.deviceId,b.gs.c=c.context,b.gs.ssd=c.sessionStartDate?c.sessionStartDate.getTime():0,b.gs.ia=c.integrationAttributes,b}function c(a){localStorage.removeItem(a);}function d(a,b,c){return f.encodePersistence(JSON.stringify(a))+";expires="+b+";path=/"+c}var f=this;// only used in persistence
/*  This function determines if a cookie is greater than the configured maxCookieSize.
        - If it is, we remove an MPID and its associated UI/UA/CSD from the cookie.
        - Once removed, check size, and repeat.
        - Never remove the currentUser's MPID from the cookie.

    MPID removal priority:
    1. If there are no currentSessionMPIDs, remove a random MPID from the the cookie.
    2. If there are currentSessionMPIDs:
        a. Remove at random MPIDs on the cookie that are not part of the currentSessionMPIDs
        b. Then remove MPIDs based on order in currentSessionMPIDs array, which
        stores MPIDs based on earliest login.
*/ // This function loops through the parts of a full hostname, attempting to set a cookie on that domain. It will set a cookie at the highest level possible.
// For example subdomain.domain.co.uk would try the following combinations:
// "co.uk" -> fail
// "domain.co.uk" -> success, return
// "subdomain.domain.co.uk" -> skipped, because already found
/**
     * set the "first seen" time for a user. the time will only be set once for a given
     * mpid after which subsequent calls will be ignored
     */ /**
     * returns the "last seen" time for a user. If the mpid represents the current user, the
     * return value will always be the current time, otherwise it will be to stored "last seen"
     * time
     */ // Forwarder Batching Code
this.useLocalStorage=function(){return !a._Store.SDKConfig.useCookieStorage&&a._Store.isLocalStorageAvailable},this.initializeStorage=function(){try{var b,c,d=f.getLocalStorage(),e=f.getCookie();// Determine if there is any data in cookies or localStorage to figure out if it is the first time the browser is loading mParticle
d||e?a._Store.isFirstRun=!1:(a._Store.isFirstRun=!0,a._Store.mpid=0),a._Store.isLocalStorageAvailable||(a._Store.SDKConfig.useCookieStorage=!0),a._Store.isLocalStorageAvailable?(b=window.localStorage,a._Store.SDKConfig.useCookieStorage?(d?(c=e?a._Helpers.extend(!1,d,e):d,b.removeItem(a._Store.storageName)):e&&(c=e),f.storeDataInMemory(c)):e?(c=d?a._Helpers.extend(!1,d,e):e,f.storeDataInMemory(c),f.expireCookies(a._Store.storageName)):f.storeDataInMemory(d)):f.storeDataInMemory(e);try{if(a._Store.isLocalStorageAvailable){var g=localStorage.getItem(a._Store.prodStorageName);if(g)var h=JSON.parse(Base64$1.decode(g));a._Store.mpid&&f.storeProductsInMemory(h,a._Store.mpid);}}catch(b){a._Store.isLocalStorageAvailable&&localStorage.removeItem(a._Store.prodStorageName),a._Store.cartProducts=[],a.Logger.error("Error loading products in initialization: "+b);}for(var i in c)c.hasOwnProperty(i)&&(SDKv2NonMPIDCookieKeys[i]||(a._Store.nonCurrentUserMPIDs[i]=c[i]));f.update();}catch(b){f.useLocalStorage()&&a._Store.isLocalStorageAvailable?localStorage.removeItem(a._Store.storageName):f.expireCookies(a._Store.storageName),a.Logger.error("Error initializing storage: "+b);}},this.update=function(){a._Store.webviewBridgeEnabled||(a._Store.SDKConfig.useCookieStorage&&f.setCookie(),f.setLocalStorage());},this.storeProductsInMemory=function(b,c){if(b)try{a._Store.cartProducts=b[c]&&b[c].cp?b[c].cp:[];}catch(b){a.Logger.error(Messages$4.ErrorMessages.CookieParseError);}},this.storeDataInMemory=function(b,c){try{b?(a._Store.mpid=c?c:b.cu||0,b.gs=b.gs||{},a._Store.sessionId=b.gs.sid||a._Store.sessionId,a._Store.isEnabled="undefined"==typeof b.gs.ie?a._Store.isEnabled:b.gs.ie,a._Store.sessionAttributes=b.gs.sa||a._Store.sessionAttributes,a._Store.serverSettings=b.gs.ss||a._Store.serverSettings,a._Store.devToken=a._Store.devToken||b.gs.dt,a._Store.SDKConfig.appVersion=a._Store.SDKConfig.appVersion||b.gs.av,a._Store.clientId=b.gs.cgid||a._Store.clientId||a._Helpers.generateUniqueId(),a._Store.deviceId=b.gs.das||a._Store.deviceId||a._Helpers.generateUniqueId(),a._Store.integrationAttributes=b.gs.ia||{},a._Store.context=b.gs.c||a._Store.context,a._Store.currentSessionMPIDs=b.gs.csm||a._Store.currentSessionMPIDs,a._Store.isLoggedIn=!0===b.l,b.gs.les&&(a._Store.dateLastEventSent=new Date(b.gs.les)),a._Store.sessionStartDate=b.gs.ssd?new Date(b.gs.ssd):new Date,b=c?b[c]:b[b.cu]):(a.Logger.verbose(Messages$4.InformationMessages.CookieNotFound),a._Store.clientId=a._Store.clientId||a._Helpers.generateUniqueId(),a._Store.deviceId=a._Store.deviceId||a._Helpers.generateUniqueId());}catch(b){a.Logger.error(Messages$4.ErrorMessages.CookieParseError);}},this.determineLocalStorageAvailability=function(a){var b;window.mParticle&&window.mParticle._forceNoLocalStorage&&(a=void 0);try{return a.setItem("mparticle","test"),b="test"===a.getItem("mparticle"),a.removeItem("mparticle"),b&&a}catch(a){return !1}},this.getUserProductsFromLS=function(b){if(!a._Store.isLocalStorageAvailable)return [];var c,d,e,f=localStorage.getItem(a._Store.prodStorageName);// if there is an MPID, we are retrieving the user's products, which is an array
if(f&&(c=Base64$1.decode(f)),b)try{return c&&(e=JSON.parse(c)),d=c&&e[b]&&e[b].cp&&Array.isArray(e[b].cp)?e[b].cp:[],d}catch(a){return []}else return []},this.getAllUserProductsFromLS=function(){var b,c,d=localStorage.getItem(a._Store.prodStorageName);d&&(b=Base64$1.decode(d));// returns an object with keys of MPID and values of array of products
try{c=JSON.parse(b);}catch(a){c={};}return c},this.setLocalStorage=function(){if(a._Store.isLocalStorageAvailable){var c=a._Store.storageName,d=f.getAllUserProductsFromLS(),e=f.getLocalStorage()||{},g=a.Identity.getCurrentUser(),h=g?g.getMPID():null,i={cp:d[h]?d[h].cp:[]};if(h){d=d||{},d[h]=i;try{window.localStorage.setItem(encodeURIComponent(a._Store.prodStorageName),Base64$1.encode(JSON.stringify(d)));}catch(b){a.Logger.error("Error with setting products on localStorage.");}}if(!a._Store.SDKConfig.useCookieStorage){e.gs=e.gs||{},e.l=a._Store.isLoggedIn?1:0,a._Store.sessionId&&(e.gs.csm=a._Store.currentSessionMPIDs),e.gs.ie=a._Store.isEnabled,h&&(e.cu=h),Object.keys(a._Store.nonCurrentUserMPIDs).length&&(e=a._Helpers.extend({},e,a._Store.nonCurrentUserMPIDs),a._Store.nonCurrentUserMPIDs={}),e=b(e);try{window.localStorage.setItem(encodeURIComponent(c),f.encodePersistence(JSON.stringify(e)));}catch(b){a.Logger.error("Error with setting localStorage item.");}}}},this.getLocalStorage=function(){if(!a._Store.isLocalStorageAvailable)return null;var b,c=a._Store.storageName,d=f.decodePersistence(window.localStorage.getItem(c)),e={};if(d)for(b in d=JSON.parse(d),d)d.hasOwnProperty(b)&&(e[b]=d[b]);return Object.keys(e).length?e:null},this.expireCookies=function(a){var b,c,d,e=new Date;d=f.getCookieDomain(),c=""===d?"":";domain="+d,e.setTime(e.getTime()-86400000),b="; expires="+e.toUTCString(),document.cookie=a+"="+b+"; path=/"+c;},this.getCookie=function(){var b,c,d,g,h,j=window.document.cookie.split("; "),k=a._Store.storageName,m=k?void 0:{};for(a.Logger.verbose(Messages$4.InformationMessages.CookieSearch),b=0,c=j.length;b<c;b++){try{d=j[b].split("="),g=d.shift(),h=d.join("=");}catch(b){a.Logger.verbose("Unable to parse cookie: "+g+". Skipping.");}if(k&&k===g){m=a._Helpers.converted(h);break}k||(m[g]=a._Helpers.converted(h));}return m?(a.Logger.verbose(Messages$4.InformationMessages.CookieFound),JSON.parse(f.decodePersistence(m))):null},this.setCookie=function(){var c,d=a.Identity.getCurrentUser();d&&(c=d.getMPID());var e,g,h,i=new Date,j=a._Store.storageName,k=f.getCookie()||{},l=new Date(i.getTime()+1e3*(60*(60*(24*a._Store.SDKConfig.cookieExpiration)))).toGMTString();e=f.getCookieDomain(),g=""===e?"":";domain="+e,k.gs=k.gs||{},a._Store.sessionId&&(k.gs.csm=a._Store.currentSessionMPIDs),c&&(k.cu=c),k.l=a._Store.isLoggedIn?1:0,k=b(k),Object.keys(a._Store.nonCurrentUserMPIDs).length&&(k=a._Helpers.extend({},k,a._Store.nonCurrentUserMPIDs),a._Store.nonCurrentUserMPIDs={}),h=f.reduceAndEncodePersistence(k,l,g,a._Store.SDKConfig.maxCookieSize),a.Logger.verbose(Messages$4.InformationMessages.CookieSet),window.document.cookie=encodeURIComponent(j)+"="+h;},this.reduceAndEncodePersistence=function(b,c,e,f){var g,h=b.gs.csm?b.gs.csm:[];// Comment 1 above
if(!h.length)for(var j in b)b.hasOwnProperty(j)&&(g=d(b,c,e),g.length>f&&!SDKv2NonMPIDCookieKeys[j]&&j!==b.cu&&delete b[j]);else {// Comment 2 above - First create an object of all MPIDs on the cookie
var k={};for(var l in b)b.hasOwnProperty(l)&&(SDKv2NonMPIDCookieKeys[l]||l===b.cu||(k[l]=1));// Comment 2a above
if(Object.keys(k).length)for(var m in k)g=d(b,c,e),g.length>f&&k.hasOwnProperty(m)&&-1===h.indexOf(m)&&delete b[m];// Comment 2b above
for(var n,o=0;o<h.length&&(g=d(b,c,e),g.length>f);o++)n=h[o],b[n]?(a.Logger.verbose("Size of new encoded cookie is larger than maxCookieSize setting of "+f+". Removing from cookie the earliest logged in MPID containing: "+JSON.stringify(b[n],0,2)),delete b[n]):a.Logger.error("Unable to save MPID data to cookies because the resulting encoded cookie is larger than the maxCookieSize setting of "+f+". We recommend using a maxCookieSize of 1500.");}return g},this.findPrevCookiesBasedOnUI=function(b){var c,d=a._Persistence.getPersistence();if(b)for(var e in b.userIdentities)if(d&&Object.keys(d).length)for(var g in d)// any value in persistence that has an MPID key will be an MPID to search through
// other keys on the cookie are currentSessionMPIDs and currentMPID which should not be searched
if(d[g].mpid){var h=d[g].ui;for(var i in h)if(e===i&&b.userIdentities[e]===h[i]){c=g;break}}c&&f.storeDataInMemory(d,c);},this.encodePersistence=function(b){for(var c in b=JSON.parse(b),b.gs)b.gs.hasOwnProperty(c)&&(Base64CookieKeys[c]?b.gs[c]?Array.isArray(b.gs[c])&&b.gs[c].length||a._Helpers.isObject(b.gs[c])&&Object.keys(b.gs[c]).length?b.gs[c]=Base64$1.encode(JSON.stringify(b.gs[c])):delete b.gs[c]:delete b.gs[c]:"ie"===c?b.gs[c]=b.gs[c]?1:0:!b.gs[c]&&delete b.gs[c]);for(var d in b)if(b.hasOwnProperty(d)&&!SDKv2NonMPIDCookieKeys[d])for(c in b[d])b[d].hasOwnProperty(c)&&Base64CookieKeys[c]&&(a._Helpers.isObject(b[d][c])&&Object.keys(b[d][c]).length?b[d][c]=Base64$1.encode(JSON.stringify(b[d][c])):delete b[d][c]);return f.createCookieString(JSON.stringify(b))},this.decodePersistence=function(b){try{if(b){if(b=JSON.parse(f.revertCookieString(b)),a._Helpers.isObject(b)&&Object.keys(b).length){for(var c in b.gs)b.gs.hasOwnProperty(c)&&(Base64CookieKeys[c]?b.gs[c]=JSON.parse(Base64$1.decode(b.gs[c])):"ie"===c&&(b.gs[c]=!!b.gs[c]));for(var d in b)if(b.hasOwnProperty(d))if(!SDKv2NonMPIDCookieKeys[d])for(c in b[d])b[d].hasOwnProperty(c)&&Base64CookieKeys[c]&&b[d][c].length&&(b[d][c]=JSON.parse(Base64$1.decode(b[d][c])));else "l"===d&&(b[d]=!!b[d]);}return JSON.stringify(b)}}catch(b){a.Logger.error("Problem with decoding cookie",b);}},this.replaceCommasWithPipes=function(a){return a.replace(/,/g,"|")},this.replacePipesWithCommas=function(a){return a.replace(/\|/g,",")},this.replaceApostrophesWithQuotes=function(a){return a.replace(/\'/g,"\"")},this.replaceQuotesWithApostrophes=function(a){return a.replace(/\"/g,"'")},this.createCookieString=function(a){return f.replaceCommasWithPipes(f.replaceQuotesWithApostrophes(a))},this.revertCookieString=function(a){return f.replacePipesWithCommas(f.replaceApostrophesWithQuotes(a))},this.getCookieDomain=function(){if(a._Store.SDKConfig.cookieDomain)return a._Store.SDKConfig.cookieDomain;var b=f.getDomain(document,location.hostname);return ""===b?"":"."+b},this.getDomain=function(a,b){var c,d,e=b.split(".");for(c=e.length-1;0<=c;c--)if(d=e.slice(c).join("."),a.cookie="mptest=cookie;domain=."+d+";",-1<a.cookie.indexOf("mptest=cookie"))return a.cookie="mptest=;domain=."+d+";expires=Thu, 01 Jan 1970 00:00:01 GMT;",d;return ""},this.getUserIdentities=function(a){var b=f.getPersistence();return b&&b[a]&&b[a].ui?b[a].ui:{}},this.getAllUserAttributes=function(a){var b=f.getPersistence();return b&&b[a]&&b[a].ua?b[a].ua:{}},this.getCartProducts=function(b){var c,d=localStorage.getItem(a._Store.prodStorageName);return d&&(c=JSON.parse(Base64$1.decode(d)),c&&c[b]&&c[b].cp)?c[b].cp:[]},this.setCartProducts=function(b){if(a._Store.isLocalStorageAvailable)try{window.localStorage.setItem(encodeURIComponent(a._Store.prodStorageName),Base64$1.encode(JSON.stringify(b)));}catch(b){a.Logger.error("Error with setting products on localStorage.");}},this.saveUserIdentitiesToPersistence=function(a,b){if(b){var c=f.getPersistence();c&&(c[a]?c[a].ui=b:c[a]={ui:b},f.savePersistence(c));}},this.saveUserAttributesToPersistence=function(a,b){var c=f.getPersistence();b&&(c&&(c[a]?c[a].ui=b:c[a]={ui:b}),f.savePersistence(c));},this.saveUserCookieSyncDatesToPersistence=function(a,b){if(b){var c=f.getPersistence();c&&(c[a]?c[a].csd=b:c[a]={csd:b}),f.savePersistence(c);}},this.saveUserConsentStateToCookies=function(b,c){//it's currently not supported to set persistence
//for any MPID that's not the current one.
if(c||null===c){var d=f.getPersistence();d&&(d[b]?d[b].con=a._Consent.ConsentSerialization.toMinifiedJsonObject(c):d[b]={con:a._Consent.ConsentSerialization.toMinifiedJsonObject(c)},f.savePersistence(d));}},this.savePersistence=function(b){var c,d=f.encodePersistence(JSON.stringify(b)),e=new Date,g=a._Store.storageName,h=new Date(e.getTime()+1e3*(60*(60*(24*a._Store.SDKConfig.cookieExpiration)))).toGMTString(),i=f.getCookieDomain();if(c=""===i?"":";domain="+i,a._Store.SDKConfig.useCookieStorage){var j=f.reduceAndEncodePersistence(b,h,c,a._Store.SDKConfig.maxCookieSize);window.document.cookie=encodeURIComponent(g)+"="+j;}else a._Store.isLocalStorageAvailable&&localStorage.setItem(a._Store.storageName,d);},this.getPersistence=function(){var a=this.useLocalStorage()?this.getLocalStorage():this.getCookie();return a},this.getConsentState=function(b){var c=f.getPersistence();return c&&c[b]&&c[b].con?a._Consent.ConsentSerialization.fromMinifiedJsonObject(c[b].con):null},this.getFirstSeenTime=function(a){if(!a)return null;var b=f.getPersistence();return b&&b[a]&&b[a].fst?b[a].fst:null},this.setFirstSeenTime=function(a,b){if(a){b||(b=new Date().getTime());var c=f.getPersistence();c&&(!c[a]&&(c[a]={}),!c[a].fst&&(c[a].fst=b,f.savePersistence(c)));}},this.getLastSeenTime=function(b){if(!b)return null;if(b===a.Identity.getCurrentUser().getMPID())//if the mpid is the current user, its last seen time is the current time
return new Date().getTime();var c=f.getPersistence();return c&&c[b]&&c[b].lst?c[b].lst:null},this.setLastSeenTime=function(a,b){if(a){b||(b=new Date().getTime());var c=f.getPersistence();c&&c[a]&&(c[a].lst=b,f.savePersistence(c));}},this.getDeviceId=function(){return a._Store.deviceId},this.setDeviceId=function(b){a._Store.deviceId=b,f.update();},this.resetPersistence=function(){if(c(StorageNames$1.localStorageName),c(StorageNames$1.localStorageNameV3),c(StorageNames$1.localStorageNameV4),c(a._Store.prodStorageName),c(a._Store.storageName),c(StorageNames$1.localStorageProductsV4),f.expireCookies(StorageNames$1.cookieName),f.expireCookies(StorageNames$1.cookieNameV2),f.expireCookies(StorageNames$1.cookieNameV3),f.expireCookies(StorageNames$1.cookieNameV4),f.expireCookies(a._Store.prodStorageName),f.expireCookies(a._Store.storageName),mParticle._isTestEnv){c(a._Helpers.createMainStorageName("abcdef")),f.expireCookies(a._Helpers.createMainStorageName("abcdef")),c(a._Helpers.createProductStorageName("abcdef"));}},this.forwardingStatsBatches={uploadsTable:{},forwardingStatsEventQueue:[]};}

var Messages$3=Constants.Messages;function Events(a){var b=this;this.logEvent=function(b,c){if(a.Logger.verbose(Messages$3.InformationMessages.StartingLogEvent+": "+b.name),a._Helpers.canLog()){var d=a._ServerModel.createEventObject(b);a._APIClient.sendEventToServer(d,c);}else a.Logger.verbose(Messages$3.InformationMessages.AbandonLogEvent);},this.startTracking=function(b){function c(b,c){if(b)try{c?b(c):b();}catch(b){a.Logger.error("Error invoking the callback passed to startTrackingLocation."),a.Logger.error(b);}}if(!a._Store.isTracking)"geolocation"in navigator&&(a._Store.watchPositionId=navigator.geolocation.watchPosition(function e(d){// prevents callback from being fired multiple times
a._Store.currentPosition={lat:d.coords.latitude,lng:d.coords.longitude},c(b,d),b=null,a._Store.isTracking=!0;},function d(){// prevents callback from being fired multiple times
c(b),b=null,a._Store.isTracking=!1;}));else {var d={coords:{latitude:a._Store.currentPosition.lat,longitude:a._Store.currentPosition.lng}};c(b,d);}},this.stopTracking=function(){a._Store.isTracking&&(navigator.geolocation.clearWatch(a._Store.watchPositionId),a._Store.currentPosition=null,a._Store.isTracking=!1);},this.logOptOut=function(){a.Logger.verbose(Messages$3.InformationMessages.StartingLogOptOut);var b=a._ServerModel.createEventObject({messageType:Types.MessageType.OptOut,eventType:Types.EventType.Other});a._APIClient.sendEventToServer(b);},this.logAST=function(){b.logEvent({messageType:Types.MessageType.AppStateTransition});},this.logCheckoutEvent=function(c,d,e,f){var g=a._Ecommerce.createCommerceEventObject(f);g&&(g.EventName+=a._Ecommerce.getProductActionEventName(Types.ProductActionType.Checkout),g.EventCategory=Types.CommerceEventType.ProductCheckout,g.ProductAction={ProductActionType:Types.ProductActionType.Checkout,CheckoutStep:c,CheckoutOptions:d,ProductList:[]},b.logCommerceEvent(g,e));},this.logProductActionEvent=function(c,d,e,f,g,h){var i=a._Ecommerce.createCommerceEventObject(f),j=Array.isArray(d)?d:[d];j.forEach(function(b){b.TotalAmount&&(b.TotalAmount=a._Ecommerce.sanitizeAmount(b.TotalAmount,"TotalAmount")),b.Position&&(b.Position=a._Ecommerce.sanitizeAmount(b.Position,"Position")),b.Price&&(b.Price=a._Ecommerce.sanitizeAmount(b.Price,"Price")),b.Quantity&&(b.Quantity=a._Ecommerce.sanitizeAmount(b.Quantity,"Quantity"));}),i&&(i.EventCategory=a._Ecommerce.convertProductActionToEventType(c),i.EventName+=a._Ecommerce.getProductActionEventName(c),i.ProductAction={ProductActionType:c,ProductList:j},a._Helpers.isObject(g)&&a._Ecommerce.convertTransactionAttributesToProductAction(g,i.ProductAction),b.logCommerceEvent(i,e,h));},this.logPurchaseEvent=function(c,d,e,f){var g=a._Ecommerce.createCommerceEventObject(f);g&&(g.EventName+=a._Ecommerce.getProductActionEventName(Types.ProductActionType.Purchase),g.EventCategory=Types.CommerceEventType.ProductPurchase,g.ProductAction={ProductActionType:Types.ProductActionType.Purchase},g.ProductAction.ProductList=a._Ecommerce.buildProductList(g,d),a._Ecommerce.convertTransactionAttributesToProductAction(c,g.ProductAction),b.logCommerceEvent(g,e));},this.logRefundEvent=function(c,d,e,f){if(!c)return void a.Logger.error(Messages$3.ErrorMessages.TransactionRequired);var g=a._Ecommerce.createCommerceEventObject(f);g&&(g.EventName+=a._Ecommerce.getProductActionEventName(Types.ProductActionType.Refund),g.EventCategory=Types.CommerceEventType.ProductRefund,g.ProductAction={ProductActionType:Types.ProductActionType.Refund},g.ProductAction.ProductList=a._Ecommerce.buildProductList(g,d),a._Ecommerce.convertTransactionAttributesToProductAction(c,g.ProductAction),b.logCommerceEvent(g,e));},this.logPromotionEvent=function(c,d,e,f,g){var h=a._Ecommerce.createCommerceEventObject(f);h&&(h.EventName+=a._Ecommerce.getPromotionActionEventName(c),h.EventCategory=a._Ecommerce.convertPromotionActionToEventType(c),h.PromotionAction={PromotionActionType:c,PromotionList:Array.isArray(d)?d:[d]},b.logCommerceEvent(h,e,g));},this.logImpressionEvent=function(c,d,e,f){var g=a._Ecommerce.createCommerceEventObject(e);g&&(g.EventName+="Impression",g.EventCategory=Types.CommerceEventType.ProductImpression,!Array.isArray(c)&&(c=[c]),g.ProductImpressions=[],c.forEach(function(a){g.ProductImpressions.push({ProductImpressionList:a.Name,ProductList:Array.isArray(a.Product)?a.Product:[a.Product]});}),b.logCommerceEvent(g,d,f));},this.logCommerceEvent=function(b,c,d){// If a developer typos the ProductActionType, the event category will be
// null, resulting in kit forwarding errors on the server.
// The check for `ProductAction` is required to denote that these are
// ProductAction events, and not impression or promotions
return a.Logger.verbose(Messages$3.InformationMessages.StartingLogCommerceEvent),b.ProductAction&&null===b.EventCategory?void a.Logger.error("Commerce event not sent.  The mParticle.ProductActionType you passed was invalid. Re-check your code."):void(c=a._Helpers.sanitizeAttributes(c,b.EventName),a._Helpers.canLog()?(a._Store.webviewBridgeEnabled&&(b.ShoppingCart={}),c&&(b.EventAttributes=c),a._APIClient.sendEventToServer(b,d),a._Persistence.update()):a.Logger.verbose(Messages$3.InformationMessages.AbandonLogEvent))},this.addEventHandler=function(c,d,f,g,h){var j,k,e=[],l=function handler(c){var d=function timeoutHandler(){j.href?window.location.href=j.href:j.submit&&j.submit();};a.Logger.verbose("DOM event triggered, handling event"),b.logEvent({messageType:Types.MessageType.PageEvent,name:"function"==typeof f?f(j):f,data:"function"==typeof g?g(j):g,eventType:h||Types.EventType.Other}),(j.href&&"_blank"!==j.target||j.submit)&&(c.preventDefault?c.preventDefault():c.returnValue=!1,setTimeout(d,a._Store.SDKConfig.timeout));};if(!d)return void a.Logger.error("Can't bind event, selector is required");// Handle a css selector string or a dom element
if("string"==typeof d?e=document.querySelectorAll(d):d.nodeType&&(e=[d]),e.length)for(a.Logger.verbose("Found "+e.length+" element"+(1<e.length?"s":"")+", attaching event handlers"),k=0;k<e.length;k++)j=e[k],j.addEventListener?j.addEventListener(c,l,!1):j.attachEvent?j.attachEvent("on"+c,l):j["on"+c]=l;else a.Logger.verbose("No elements found");};}

var StorageNames=Constants.StorageNames,Base64=Polyfill.Base64,CookiesGlobalSettingsKeys={das:1},MPIDKeys={ui:1};function Migrations(a){function b(){var b,d,f,g,j,k,m=window.document.cookie.split("; ");for(a.Logger.verbose(Constants.Messages.InformationMessages.CookieSearch),d=0,f=m.length;d<f;d++){try{g=m[d].split("="),j=a._Helpers.decoded(g.shift()),k=a._Helpers.decoded(g.join("="));}catch(b){a.Logger.verbose("Unable to parse cookie: "+j+". Skipping.");}//most recent version needs no migration
if(j===a._Store.storageName)return;if(j===StorageNames.cookieNameV4)return c(k,StorageNames.cookieNameV4),void(a._Store.isLocalStorageAvailable&&e());// migration path for SDKv1CookiesV3, doesn't need to be encoded
if(j===StorageNames.cookieNameV3){b=h.convertSDKv1CookiesV3ToSDKv2CookiesV4(k),c(b,StorageNames.cookieNameV3);break}}}function c(b,c){var d,e,f=new Date,g=a._Persistence.getCookieDomain();d=new Date(f.getTime()+1e3*(60*(60*(24*StorageNames.CookieExpiration)))).toGMTString(),e=""===g?"":";domain="+g,a.Logger.verbose(Constants.Messages.InformationMessages.CookieSet),window.document.cookie=encodeURIComponent(a._Store.storageName)+"="+b+";expires="+d+";path=/"+e,a._Persistence.expireCookies(c),a._Store.migratingToIDSyncCookies=!0;}function d(b){try{var c={gs:{csm:[]}};for(var d in b=JSON.parse(b),b)b.hasOwnProperty(d)&&(CookiesGlobalSettingsKeys[d]?c.gs[d]=b[d]:"mpid"===d?c.cu=b[d]:b.mpid&&(c[b.mpid]=c[b.mpid]||{},MPIDKeys[d]&&(c[b.mpid][d]=b[d])));return JSON.stringify(c)}catch(b){a.Logger.error("Failed to restructure previous cookie into most current cookie schema");}}function e(){var b=StorageNames.localStorageProductsV4,c=localStorage.getItem(StorageNames.localStorageProductsV4);localStorage.setItem(a._Store.prodStorageName,c),localStorage.removeItem(b);}function f(b,c){if(a._Store.isLocalStorageAvailable){var d={};if(d[c]={},b.cp){try{d[c].cp=JSON.parse(Base64.decode(b.cp));}catch(a){d[c].cp=b.cp;}Array.isArray(d[c].cp)||(d[c].cp=[]);}localStorage.setItem(a._Store.prodStorageName,Base64.encode(JSON.stringify(d)));}}function g(){function b(b,c){try{window.localStorage.setItem(encodeURIComponent(a._Store.storageName),b);}catch(b){a.Logger.error("Error with setting localStorage item.");}window.localStorage.removeItem(encodeURIComponent(c));}var c,d,g,i,j=StorageNames.localStorageNameV3,k=StorageNames.localStorageNameV4,l=window.localStorage.getItem(a._Store.storageName);if(!l){if(d=window.localStorage.getItem(k),d)return b(d,k),void e();if(g=window.localStorage.getItem(j),g){// localStorage may contain only products, or the full persistence
// when there is an MPID on the cookie, it is the full persistence
if(a._Store.migratingToIDSyncCookies=!0,i=g.slice(),g=JSON.parse(a._Persistence.replacePipesWithCommas(a._Persistence.replaceApostrophesWithQuotes(g))),g.mpid)return g=JSON.parse(h.convertSDKv1CookiesV3ToSDKv2CookiesV4(i)),void b(JSON.stringify(g),j);// if no MPID, it is only the products
if((g.cp||g.pb)&&!g.mpid)return c=a._Persistence.getCookie(),c?(f(g,c.cu),void localStorage.removeItem(StorageNames.localStorageNameV3)):void localStorage.removeItem(StorageNames.localStorageNameV3)}}}var h=this;//  if there is a cookie or localStorage:
//  1. determine which version it is ('mprtcl-api', 'mprtcl-v2', 'mprtcl-v3', 'mprtcl-v4')
//  2. return if 'mprtcl-v4', otherwise migrate to mprtclv4 schema
// 3. if 'mprtcl-api', could be JSSDKv2 or JSSDKv1. JSSDKv2 cookie has a 'globalSettings' key on it
this.migrate=function(){try{b();}catch(b){a._Persistence.expireCookies(StorageNames.cookieNameV3),a._Persistence.expireCookies(StorageNames.cookieNameV4),a.Logger.error("Error migrating cookie: "+b);}if(a._Store.isLocalStorageAvailable)try{g();}catch(b){localStorage.removeItem(StorageNames.localStorageNameV3),localStorage.removeItem(StorageNames.localStorageNameV4),a.Logger.error("Error migrating localStorage: "+b);}},this.convertSDKv1CookiesV3ToSDKv2CookiesV4=function(b){b=a._Persistence.replacePipesWithCommas(a._Persistence.replaceApostrophesWithQuotes(b));var c=JSON.parse(b),e=JSON.parse(d(b));return c.mpid&&(e.gs.csm.push(c.mpid),e.gs.csm=Base64.encode(JSON.stringify(e.gs.csm)),f(c,c.mpid)),JSON.stringify(e)};}

function filteredMparticleUser(a,b,c,d){var e=this;return {getUserIdentities:function getUserIdentities(){var e={},f=c._Persistence.getUserIdentities(a);for(var g in f)if(f.hasOwnProperty(g)){var h=Types.IdentityType.getIdentityName(c._Helpers.parseNumber(g));d&&(!d||d.isIdentityBlocked(h))||(//if identity type is not blocked
e[h]=f[g]);}return e=c._Helpers.filterUserIdentitiesForForwarders(e,b.userIdentityFilters),{userIdentities:e}},getMPID:function getMPID(){return a},getUserAttributesLists:function getUserAttributesLists(a){var b,f={};for(var g in b=e.getAllUserAttributes(),b)b.hasOwnProperty(g)&&Array.isArray(b[g])&&(d&&(!d||d.isAttributeKeyBlocked(g))||(f[g]=b[g].slice()));return f=c._Helpers.filterUserAttributes(f,a.userAttributeFilters),f},getAllUserAttributes:function getAllUserAttributes(){var e={},f=c._Persistence.getAllUserAttributes(a);if(f)for(var g in f)f.hasOwnProperty(g)&&(d&&(!d||d.isAttributeKeyBlocked(g))||(Array.isArray(f[g])?e[g]=f[g].slice():e[g]=f[g]));return e=c._Helpers.filterUserAttributes(e,b.userAttributeFilters),e}}}

function Forwarders(a,b){var c=this;this.initForwarders=function(b,d){var e=a.Identity.getCurrentUser();!a._Store.webviewBridgeEnabled&&a._Store.configuredForwarders&&(a._Store.configuredForwarders.sort(function(a,b){return a.settings.PriorityValue=a.settings.PriorityValue||0,b.settings.PriorityValue=b.settings.PriorityValue||0,-1*(a.settings.PriorityValue-b.settings.PriorityValue)}),a._Store.activeForwarders=a._Store.configuredForwarders.filter(function(f){if(!a._Consent.isEnabledForUserConsent(f.filteringConsentRuleValues,e))return !1;if(!c.isEnabledForUserAttributes(f.filteringUserAttributeValue,e))return !1;if(!c.isEnabledForUnknownUser(f.excludeAnonymousUser,e))return !1;var g=a._Helpers.filterUserIdentities(b,f.userIdentityFilters),h=a._Helpers.filterUserAttributes(e?e.getAllUserAttributes():{},f.userAttributeFilters);return f.initialized||(f.logger=a.Logger,f.init(f.settings,d,!1,null,h,g,a._Store.SDKConfig.appVersion,a._Store.SDKConfig.appName,a._Store.SDKConfig.customFlags,a._Store.clientId),f.initialized=!0),!0}));},this.isEnabledForUserAttributes=function(b,c){if(!b||!a._Helpers.isObject(b)||!Object.keys(b).length)return !0;var d,e,f;if(!c)return !1;f=c.getAllUserAttributes();var g=!1;try{if(f&&a._Helpers.isObject(f)&&Object.keys(f).length)for(var h in f)if(f.hasOwnProperty(h)&&(d=a._Helpers.generateHash(h).toString(),e=a._Helpers.generateHash(f[h]).toString(),d===b.userAttributeName&&e===b.userAttributeValue)){g=!0;break}return !b||b.includeOnMatch===g}catch(a){// in any error scenario, err on side of returning true and forwarding event
return !0}},this.isEnabledForUnknownUser=function(a,b){return !!(b&&b.isLoggedIn()||!a)},this.applyToForwarders=function(b,c){a._Store.activeForwarders.length&&a._Store.activeForwarders.forEach(function(d){var e=d[b];if(e)try{var f=d[b](c);f&&a.Logger.verbose(f);}catch(b){a.Logger.verbose(b);}});},this.sendEventToForwarders=function(b){var c,d,e,f=function(b,c){b.UserIdentities&&b.UserIdentities.length&&b.UserIdentities.forEach(function(d,e){a._Helpers.inArray(c,d.Type)&&(b.UserIdentities.splice(e,1),0<e&&e--);});},g=function(b,c){var d;if(c)for(var e in b.EventAttributes)b.EventAttributes.hasOwnProperty(e)&&(d=a._Helpers.generateHash(b.EventCategory+b.EventName+e),a._Helpers.inArray(c,d)&&delete b.EventAttributes[e]);},h=function(b,c){return !!(b&&b.length&&a._Helpers.inArray(b,c))},j=[Types.MessageType.PageEvent,Types.MessageType.PageView,Types.MessageType.Commerce];if(!a._Store.webviewBridgeEnabled&&a._Store.activeForwarders){d=a._Helpers.generateHash(b.EventCategory+b.EventName),e=a._Helpers.generateHash(b.EventCategory);for(var k=0;k<a._Store.activeForwarders.length;k++){// Check attribute forwarding rule. This rule allows users to only forward an event if a
// specific attribute exists and has a specific value. Alternatively, they can specify
// that an event not be forwarded if the specified attribute name and value exists.
// The two cases are controlled by the "includeOnMatch" boolean value.
// Supported message types for attribute forwarding rules are defined in the forwardingRuleMessageTypes array
if(-1<j.indexOf(b.EventDataType)&&a._Store.activeForwarders[k].filteringEventAttributeValue&&a._Store.activeForwarders[k].filteringEventAttributeValue.eventAttributeName&&a._Store.activeForwarders[k].filteringEventAttributeValue.eventAttributeValue){var l=null;// Attempt to find the attribute in the collection of event attributes
if(b.EventAttributes)for(var m in b.EventAttributes){var n;if(n=a._Helpers.generateHash(m).toString(),n===a._Store.activeForwarders[k].filteringEventAttributeValue.eventAttributeName&&(l={name:n,value:a._Helpers.generateHash(b.EventAttributes[m]).toString()}),l)break}var o=null!==l&&l.value===a._Store.activeForwarders[k].filteringEventAttributeValue.eventAttributeValue,p=!0===a._Store.activeForwarders[k].filteringEventAttributeValue.includeOnMatch?o:!o;if(!p)continue}// Clone the event object, as we could be sending different attributes to each forwarder
// Check event filtering rules
if(c={},c=a._Helpers.extend(!0,c,b),b.EventDataType===Types.MessageType.PageEvent&&(h(a._Store.activeForwarders[k].eventNameFilters,d)||h(a._Store.activeForwarders[k].eventTypeFilters,e)))continue;else if(b.EventDataType===Types.MessageType.Commerce&&h(a._Store.activeForwarders[k].eventTypeFilters,e))continue;else if(b.EventDataType===Types.MessageType.PageView&&h(a._Store.activeForwarders[k].screenNameFilters,d))continue;// Check attribute filtering rules
if(c.EventAttributes&&(b.EventDataType===Types.MessageType.PageEvent?g(c,a._Store.activeForwarders[k].attributeFilters):b.EventDataType===Types.MessageType.PageView&&g(c,a._Store.activeForwarders[k].screenAttributeFilters)),f(c,a._Store.activeForwarders[k].userIdentityFilters),c.UserAttributes=a._Helpers.filterUserAttributes(c.UserAttributes,a._Store.activeForwarders[k].userAttributeFilters),a._Store.activeForwarders[k].process){a.Logger.verbose("Sending message to forwarder: "+a._Store.activeForwarders[k].name);var q=a._Store.activeForwarders[k].process(c);q&&a.Logger.verbose(q);}}}},this.callSetUserAttributeOnForwarders=function(c,d){b&&b.isAttributeKeyBlocked(c)||a._Store.activeForwarders.length&&a._Store.activeForwarders.forEach(function(b){if(b.setUserAttribute&&b.userAttributeFilters&&!a._Helpers.inArray(b.userAttributeFilters,a._Helpers.generateHash(c)))try{var e=b.setUserAttribute(c,d);e&&a.Logger.verbose(e);}catch(b){a.Logger.error(b);}});},this.setForwarderUserIdentities=function(b){a._Store.activeForwarders.forEach(function(c){var d=a._Helpers.filterUserIdentities(b,c.userIdentityFilters);c.setUserIdentity&&d.forEach(function(b){var d=c.setUserIdentity(b.Identity,b.Type);d&&a.Logger.verbose(d);});});},this.setForwarderOnUserIdentified=function(c){a._Store.activeForwarders.forEach(function(d){var e=filteredMparticleUser(c.getMPID(),d,a,b);if(d.onUserIdentified){var f=d.onUserIdentified(e);f&&a.Logger.verbose(f);}});},this.setForwarderOnIdentityComplete=function(c,d){var e;a._Store.activeForwarders.forEach(function(f){var g=filteredMparticleUser(c.getMPID(),f,a,b);"identify"===d?f.onIdentifyComplete&&(e=f.onIdentifyComplete(g),e&&a.Logger.verbose(e)):"login"===d?f.onLoginComplete&&(e=f.onLoginComplete(g),e&&a.Logger.verbose(e)):"logout"===d?f.onLogoutComplete&&(e=f.onLogoutComplete(g),e&&a.Logger.verbose(e)):"modify"==d&&f.onModifyComplete&&(e=f.onModifyComplete(g),e&&a.Logger.verbose(e));});},this.getForwarderStatsQueue=function(){return a._Persistence.forwardingStatsBatches.forwardingStatsEventQueue},this.setForwarderStatsQueue=function(b){a._Persistence.forwardingStatsBatches.forwardingStatsEventQueue=b;},this.configureForwarder=function(b){var c=null,d=b,e={};// if there are kits inside of mpInstance._Store.SDKConfig.kits, then mParticle is self hosted
for(var f in a._Helpers.isObject(a._Store.SDKConfig.kits)&&0<Object.keys(a._Store.SDKConfig.kits).length?e=a._Store.SDKConfig.kits:0<a._preInit.forwarderConstructors.length&&a._preInit.forwarderConstructors.forEach(function(a){e[a.name]=a;}),e)if(f===d.name&&(d.isDebug===a._Store.SDKConfig.isDevelopmentMode||d.isSandbox===a._Store.SDKConfig.isDevelopmentMode)){c=new e[f].constructor,c.id=d.moduleId,c.isSandbox=d.isDebug||d.isSandbox,c.hasSandbox="true"===d.hasDebugString,c.isVisible=d.isVisible,c.settings=d.settings,c.eventNameFilters=d.eventNameFilters,c.eventTypeFilters=d.eventTypeFilters,c.attributeFilters=d.attributeFilters,c.screenNameFilters=d.screenNameFilters,c.screenNameFilters=d.screenNameFilters,c.screenAttributeFilters=d.screenAttributeFilters,c.userIdentityFilters=d.userIdentityFilters,c.userAttributeFilters=d.userAttributeFilters,c.filteringEventAttributeValue=d.filteringEventAttributeValue,c.filteringUserAttributeValue=d.filteringUserAttributeValue,c.eventSubscriptionId=d.eventSubscriptionId,c.filteringConsentRuleValues=d.filteringConsentRuleValues,c.excludeAnonymousUser=d.excludeAnonymousUser,a._Store.configuredForwarders.push(c);break}},this.configurePixel=function(b){(b.isDebug===a._Store.SDKConfig.isDevelopmentMode||b.isProduction!==a._Store.SDKConfig.isDevelopmentMode)&&a._Store.pixelConfigurations.push(b);},this.processForwarders=function(b,d){if(!b)a.Logger.warning("No config was passed. Cannot process forwarders");else try{Array.isArray(b.kitConfigs)&&b.kitConfigs.length&&b.kitConfigs.forEach(function(a){c.configureForwarder(a);}),Array.isArray(b.pixelConfigs)&&b.pixelConfigs.length&&b.pixelConfigs.forEach(function(a){c.configurePixel(a);}),c.initForwarders(a._Store.SDKConfig.identifyRequest.userIdentities,d);}catch(b){a.Logger.error("Config was not parsed propertly. Forwarders may not be initialized.");}};}

var MessageType=Types.MessageType,ApplicationTransitionType=Types.ApplicationTransitionType;function ServerModel(a){function b(a,b){var c=[];for(var d in b.flags={},a.CustomFlags)c=[],a.CustomFlags.hasOwnProperty(d)&&(Array.isArray(a.CustomFlags[d])?a.CustomFlags[d].forEach(function(a){("number"==typeof a||"string"==typeof a||"boolean"==typeof a)&&c.push(a.toString());}):("number"==typeof a.CustomFlags[d]||"string"==typeof a.CustomFlags[d]||"boolean"==typeof a.CustomFlags[d])&&c.push(a.CustomFlags[d].toString()),c.length&&(b.flags[d]=c));}function c(a){return a?a.map(function(a){return d(a)}):[]}function d(b){return {id:a._Helpers.parseStringOrNumber(b.Sku),nm:a._Helpers.parseStringOrNumber(b.Name),pr:a._Helpers.parseNumber(b.Price),qt:a._Helpers.parseNumber(b.Quantity),br:a._Helpers.parseStringOrNumber(b.Brand),va:a._Helpers.parseStringOrNumber(b.Variant),ca:a._Helpers.parseStringOrNumber(b.Category),ps:a._Helpers.parseNumber(b.Position),cc:a._Helpers.parseStringOrNumber(b.CouponCode),tpa:a._Helpers.parseNumber(b.TotalAmount),attrs:b.Attributes}}var e=this;this.appendUserInfo=function(b,c){if(c){if(!b)return c.MPID=null,c.ConsentState=null,c.UserAttributes=null,void(c.UserIdentities=null);if(!(c.MPID&&c.MPID===b.getMPID())){c.MPID=b.getMPID(),c.ConsentState=b.getConsentState(),c.UserAttributes=b.getAllUserAttributes();var d=b.getUserIdentities().userIdentities,e={};for(var f in d){var g=Types.IdentityType.getIdentityType(f);!1!==g&&(e[g]=d[f]);}var h=[];if(a._Helpers.isObject(e)&&Object.keys(e).length)for(var i in e){var j={};j.Identity=e[i],j.Type=a._Helpers.parseNumber(i),h.push(j);}c.UserIdentities=h;}}},this.convertToConsentStateDTO=function(a){if(!a)return null;var b={},c=a.getGDPRConsentState();if(c){var d={};for(var e in b.gdpr=d,c)if(c.hasOwnProperty(e)){var f=c[e];b.gdpr[e]={},"boolean"==typeof f.Consented&&(d[e].c=f.Consented),"number"==typeof f.Timestamp&&(d[e].ts=f.Timestamp),"string"==typeof f.ConsentDocument&&(d[e].d=f.ConsentDocument),"string"==typeof f.Location&&(d[e].l=f.Location),"string"==typeof f.HardwareId&&(d[e].h=f.HardwareId);}}var g=a.getCCPAConsentState();return g&&(b.ccpa={data_sale_opt_out:{c:g.Consented,ts:g.Timestamp,d:g.ConsentDocument,l:g.Location,h:g.HardwareId}}),b},this.createEventObject=function(b,c){var d={},f={},g=b.messageType===Types.MessageType.OptOut?!a._Store.isEnabled:null;if(a._Store.sessionId||b.messageType==Types.MessageType.OptOut||a._Store.webviewBridgeEnabled){f=b.hasOwnProperty("toEventAPIObject")?b.toEventAPIObject():{EventName:b.name||b.messageType,EventCategory:b.eventType,EventAttributes:a._Helpers.sanitizeAttributes(b.data,b.name),SourceMessageId:b.sourceMessageId||a._Helpers.generateUniqueId(),EventDataType:b.messageType,CustomFlags:b.customFlags||{},UserAttributeChanges:b.userAttributeChanges,UserIdentityChanges:b.userIdentityChanges},b.messageType!==Types.MessageType.SessionEnd&&(a._Store.dateLastEventSent=new Date),d={Store:a._Store.serverSettings,SDKVersion:Constants.sdkVersion,SessionId:a._Store.sessionId,SessionStartDate:a._Store.sessionStartDate?a._Store.sessionStartDate.getTime():0,Debug:a._Store.SDKConfig.isDevelopmentMode,Location:a._Store.currentPosition,OptOut:g,ExpandedEventCount:0,AppVersion:a.getAppVersion(),AppName:a.getAppName(),Package:a._Store.SDKConfig["package"],ClientGeneratedId:a._Store.clientId,DeviceId:a._Store.deviceId,IntegrationAttributes:a._Store.integrationAttributes,CurrencyCode:a._Store.currencyCode,DataPlan:a._Store.SDKConfig.dataPlan?a._Store.SDKConfig.dataPlan:{}},f.EventDataType===MessageType.AppStateTransition&&(f.IsFirstRun=a._Store.isFirstRun,f.LaunchReferral=window.location.href||null),f.CurrencyCode=a._Store.currencyCode;var h=c||a.Identity.getCurrentUser();return e.appendUserInfo(h,f),b.messageType===Types.MessageType.SessionEnd&&(f.SessionLength=a._Store.dateLastEventSent.getTime()-a._Store.sessionStartDate.getTime(),f.currentSessionMPIDs=a._Store.currentSessionMPIDs,f.EventAttributes=a._Store.sessionAttributes,a._Store.currentSessionMPIDs=[],a._Store.sessionStartDate=null),d.Timestamp=a._Store.dateLastEventSent.getTime(),a._Helpers.extend({},f,d)}return null},this.convertEventToDTO=function(d){var f={n:d.EventName,et:d.EventCategory,ua:d.UserAttributes,ui:d.UserIdentities,ia:d.IntegrationAttributes,str:d.Store,attrs:d.EventAttributes,sdk:d.SDKVersion,sid:d.SessionId,sl:d.SessionLength,ssd:d.SessionStartDate,dt:d.EventDataType,dbg:d.Debug,ct:d.Timestamp,lc:d.Location,o:d.OptOut,eec:d.ExpandedEventCount,av:d.AppVersion,cgid:d.ClientGeneratedId,das:d.DeviceId,mpid:d.MPID,smpids:d.currentSessionMPIDs};d.DataPlan&&d.DataPlan.PlanId&&(f.dp_id=d.DataPlan.PlanId,d.DataPlan.PlanVersion&&(f.dp_v=d.DataPlan.PlanVersion));var g=e.convertToConsentStateDTO(d.ConsentState);return g&&(f.con=g),d.EventDataType===MessageType.AppStateTransition&&(f.fr=d.IsFirstRun,f.iu=!1,f.at=ApplicationTransitionType.AppInit,f.lr=d.LaunchReferral,f.attrs=null),d.CustomFlags&&b(d,f),d.EventDataType===MessageType.Commerce?(f.cu=d.CurrencyCode,d.ShoppingCart&&(f.sc={pl:c(d.ShoppingCart.ProductList)}),d.ProductAction?f.pd={an:d.ProductAction.ProductActionType,cs:a._Helpers.parseNumber(d.ProductAction.CheckoutStep),co:d.ProductAction.CheckoutOptions,pl:c(d.ProductAction.ProductList),ti:d.ProductAction.TransactionId,ta:d.ProductAction.Affiliation,tcc:d.ProductAction.CouponCode,tr:a._Helpers.parseNumber(d.ProductAction.TotalAmount),ts:a._Helpers.parseNumber(d.ProductAction.ShippingAmount),tt:a._Helpers.parseNumber(d.ProductAction.TaxAmount)}:d.PromotionAction?f.pm={an:d.PromotionAction.PromotionActionType,pl:d.PromotionAction.PromotionList.map(function(a){return {id:a.Id,nm:a.Name,cr:a.Creative,ps:a.Position?a.Position:0}})}:d.ProductImpressions&&(f.pi=d.ProductImpressions.map(function(a){return {pil:a.ProductImpressionList,pl:c(a.ProductList)}}))):d.EventDataType===MessageType.Profile&&(f.pet=d.ProfileMessageType),f};}

function forwardingStatsUploader(a){function b(){var b=a._Forwarders.getForwarderStatsQueue(),c=a._Persistence.forwardingStatsBatches.uploadsTable,d=Date.now();for(var e in b.length&&(c[d]={uploading:!1,data:b},a._Forwarders.setForwarderStatsQueue([])),c)(function(b){if(c.hasOwnProperty(b)&&!1===c[b].uploading){var d=function(){4===e.readyState&&(200===e.status||202===e.status?(a.Logger.verbose("Successfully sent  "+e.statusText+" from server"),delete c[b]):"4"===e.status.toString()[0]?429!==e.status&&delete c[b]:c[b].uploading=!1);},e=a._Helpers.createXHR(d),f=c[b].data;c[b].uploading=!0,a._APIClient.sendBatchForwardingStatsToServer(f,e);}})(e);}this.startForwardingStatsTimer=function(){mParticle._forwardingStatsTimer=setInterval(function(){b();},a._Store.SDKConfig.forwarderStatsTimeout);};}

var Messages$2=Constants.Messages,HTTPCodes$2=Constants.HTTPCodes;function Identity(t){var s=this;/**
     * Invoke these methods on the mParticle.Identity object.
     * Example: mParticle.Identity.getCurrentUser().
     * @class mParticle.Identity
     */ /**
     * Invoke these methods on the mParticle.Identity.getCurrentUser() object.
     * Example: mParticle.Identity.getCurrentUser().getAllUserAttributes()
     * @class mParticle.Identity.getCurrentUser()
     */ /**
     * Invoke these methods on the mParticle.Identity.getCurrentUser().getCart() object.
     * Example: mParticle.Identity.getCurrentUser().getCart().add(...);
     * @class mParticle.Identity.getCurrentUser().getCart()
     * @deprecated
     */ // send a user identity change request on identify, login, logout, modify when any values change.
// compare what identities exist vs what is previously was for the specific user if they were in memory before.
// if it's the first time the user is logging in, send a user identity change request with
this.checkIdentitySwap=function(e,s,r){if(e&&s&&e!==s){var i=t._Persistence.getPersistence();i&&(i.cu=s,i.gs.csm=r,t._Persistence.savePersistence(i));}},this.IdentityRequest={createKnownIdentities:function createKnownIdentities(e,s){var r={};if(e&&e.userIdentities&&t._Helpers.isObject(e.userIdentities))for(var i in e.userIdentities)r[i]=e.userIdentities[i];return r.device_application_stamp=s,r},preProcessIdentityRequest:function preProcessIdentityRequest(e,s,r){t.Logger.verbose(Messages$2.InformationMessages.StartingLogEvent+": "+r);var i=t._Helpers.Validators.validateIdentities(e,r);if(!i.valid)return t.Logger.error("ERROR: "+i.error),{valid:!1,error:i.error};if(s&&!t._Helpers.Validators.isFunction(s)){var n="The optional callback must be a function. You tried entering a(n) "+_typeof(s);return t.Logger.error(n),{valid:!1,error:n}}return {valid:!0}},createIdentityRequest:function createIdentityRequest(e,s,r,i,n,o,a){var d={client_sdk:{platform:s,sdk_vendor:r,sdk_version:i},context:o,environment:t._Store.SDKConfig.isDevelopmentMode?"development":"production",request_id:t._Helpers.generateUniqueId(),request_timestamp_ms:new Date().getTime(),previous_mpid:a||null,known_identities:this.createKnownIdentities(e,n)};return d},createModifyIdentityRequest:function createModifyIdentityRequest(e,s,r,i,n,o){return {client_sdk:{platform:r,sdk_vendor:i,sdk_version:n},context:o,environment:t._Store.SDKConfig.isDevelopmentMode?"development":"production",request_id:t._Helpers.generateUniqueId(),request_timestamp_ms:new Date().getTime(),identity_changes:this.createIdentityChanges(e,s)}},createIdentityChanges:function createIdentityChanges(e,s){var r,i=[];if(s&&t._Helpers.isObject(s)&&e&&t._Helpers.isObject(e))for(r in s)i.push({old_value:e[r]||null,new_value:s[r],identity_type:r});return i},// takes 2 UI objects keyed by name, combines them, returns them keyed by type
combineUserIdentities:function combineUserIdentities(e,s){var r={},i=t._Helpers.extend(e,s);for(var n in i){var o=Types.IdentityType.getIdentityType(n);// this check removes anything that is not whitelisted as an identity type
!1!==o&&0<=o&&(r[Types.IdentityType.getIdentityType(n)]=i[n]);}return r},createAliasNetworkRequest:function createAliasNetworkRequest(e){return {request_id:t._Helpers.generateUniqueId(),request_type:"alias",environment:t._Store.SDKConfig.isDevelopmentMode?"development":"production",api_key:t._Store.devToken,data:{destination_mpid:e.destinationMpid,source_mpid:e.sourceMpid,start_unixtime_ms:e.startTime,end_unixtime_ms:e.endTime,scope:e.scope,device_application_stamp:t._Store.deviceId}}},convertAliasToNative:function convertAliasToNative(e){return {DestinationMpid:e.destinationMpid,SourceMpid:e.sourceMpid,StartUnixtimeMs:e.startTime,EndUnixtimeMs:e.endTime}},convertToNative:function convertToNative(e){var t=[];if(e&&e.userIdentities){for(var s in e.userIdentities)e.userIdentities.hasOwnProperty(s)&&t.push({Type:Types.IdentityType.getIdentityType(s),Identity:e.userIdentities[s]});return {UserIdentities:t}}}},this.IdentityAPI={HTTPCodes:HTTPCodes$2,/**
         * Initiate a logout request to the mParticle server
         * @method identify
         * @param {Object} identityApiData The identityApiData object as indicated [here](https://github.com/mParticle/mparticle-sdk-javascript/blob/master-v2/README.md#1-customize-the-sdk)
         * @param {Function} [callback] A callback function that is called when the identify request completes
         */identify:function identify(e,r){var i,n=t.Identity.getCurrentUser(),o=t._Identity.IdentityRequest.preProcessIdentityRequest(e,r,"identify");if(n&&(i=n.getMPID()),o.valid){var a=t._Identity.IdentityRequest.createIdentityRequest(e,Constants.platform,Constants.sdkVendor,Constants.sdkVersion,t._Store.deviceId,t._Store.context,i);t._Helpers.canLog()?t._Store.webviewBridgeEnabled?(t._NativeSdkHelpers.sendToNative(Constants.NativeSdkPaths.Identify,JSON.stringify(t._Identity.IdentityRequest.convertToNative(e))),t._Helpers.invokeCallback(r,HTTPCodes$2.nativeIdentityRequest,"Identify request sent to native sdk")):t._IdentityAPIClient.sendIdentityRequest(a,"identify",r,e,s.parseIdentityResponse,i):(t._Helpers.invokeCallback(r,HTTPCodes$2.loggingDisabledOrMissingAPIKey,Messages$2.InformationMessages.AbandonLogEvent),t.Logger.verbose(Messages$2.InformationMessages.AbandonLogEvent));}else t._Helpers.invokeCallback(r,HTTPCodes$2.validationIssue,o.error),t.Logger.verbose(o);},/**
         * Initiate a logout request to the mParticle server
         * @method logout
         * @param {Object} identityApiData The identityApiData object as indicated [here](https://github.com/mParticle/mparticle-sdk-javascript/blob/master-v2/README.md#1-customize-the-sdk)
         * @param {Function} [callback] A callback function that is called when the logout request completes
         */logout:function logout(e,r){var i,n=t.Identity.getCurrentUser(),o=t._Identity.IdentityRequest.preProcessIdentityRequest(e,r,"logout");if(n&&(i=n.getMPID()),o.valid){var a,d=t._Identity.IdentityRequest.createIdentityRequest(e,Constants.platform,Constants.sdkVendor,Constants.sdkVersion,t._Store.deviceId,t._Store.context,i);t._Helpers.canLog()?t._Store.webviewBridgeEnabled?(t._NativeSdkHelpers.sendToNative(Constants.NativeSdkPaths.Logout,JSON.stringify(t._Identity.IdentityRequest.convertToNative(e))),t._Helpers.invokeCallback(r,HTTPCodes$2.nativeIdentityRequest,"Logout request sent to native sdk")):(t._IdentityAPIClient.sendIdentityRequest(d,"logout",r,e,s.parseIdentityResponse,i),a=t._ServerModel.createEventObject({messageType:Types.MessageType.Profile}),a.ProfileMessageType=Types.ProfileMessageType.Logout,t._Store.activeForwarders.length&&t._Store.activeForwarders.forEach(function(e){e.logOut&&e.logOut(a);})):(t._Helpers.invokeCallback(r,HTTPCodes$2.loggingDisabledOrMissingAPIKey,Messages$2.InformationMessages.AbandonLogEvent),t.Logger.verbose(Messages$2.InformationMessages.AbandonLogEvent));}else t._Helpers.invokeCallback(r,HTTPCodes$2.validationIssue,o.error),t.Logger.verbose(o);},/**
         * Initiate a login request to the mParticle server
         * @method login
         * @param {Object} identityApiData The identityApiData object as indicated [here](https://github.com/mParticle/mparticle-sdk-javascript/blob/master-v2/README.md#1-customize-the-sdk)
         * @param {Function} [callback] A callback function that is called when the login request completes
         */login:function login(e,r){var i,n=t.Identity.getCurrentUser(),o=t._Identity.IdentityRequest.preProcessIdentityRequest(e,r,"login");if(n&&(i=n.getMPID()),o.valid){var a=t._Identity.IdentityRequest.createIdentityRequest(e,Constants.platform,Constants.sdkVendor,Constants.sdkVersion,t._Store.deviceId,t._Store.context,i);t._Helpers.canLog()?t._Store.webviewBridgeEnabled?(t._NativeSdkHelpers.sendToNative(Constants.NativeSdkPaths.Login,JSON.stringify(t._Identity.IdentityRequest.convertToNative(e))),t._Helpers.invokeCallback(r,HTTPCodes$2.nativeIdentityRequest,"Login request sent to native sdk")):t._IdentityAPIClient.sendIdentityRequest(a,"login",r,e,s.parseIdentityResponse,i):(t._Helpers.invokeCallback(r,HTTPCodes$2.loggingDisabledOrMissingAPIKey,Messages$2.InformationMessages.AbandonLogEvent),t.Logger.verbose(Messages$2.InformationMessages.AbandonLogEvent));}else t._Helpers.invokeCallback(r,HTTPCodes$2.validationIssue,o.error),t.Logger.verbose(o);},/**
         * Initiate a modify request to the mParticle server
         * @method modify
         * @param {Object} identityApiData The identityApiData object as indicated [here](https://github.com/mParticle/mparticle-sdk-javascript/blob/master-v2/README.md#1-customize-the-sdk)
         * @param {Function} [callback] A callback function that is called when the modify request completes
         */modify:function modify(e,r){var i,n=t.Identity.getCurrentUser(),o=t._Identity.IdentityRequest.preProcessIdentityRequest(e,r,"modify");n&&(i=n.getMPID());var a=e&&e.userIdentities?e.userIdentities:{};if(o.valid){var d=t._Identity.IdentityRequest.createModifyIdentityRequest(n?n.getUserIdentities().userIdentities:{},a,Constants.platform,Constants.sdkVendor,Constants.sdkVersion,t._Store.context);t._Helpers.canLog()?t._Store.webviewBridgeEnabled?(t._NativeSdkHelpers.sendToNative(Constants.NativeSdkPaths.Modify,JSON.stringify(t._Identity.IdentityRequest.convertToNative(e))),t._Helpers.invokeCallback(r,HTTPCodes$2.nativeIdentityRequest,"Modify request sent to native sdk")):t._IdentityAPIClient.sendIdentityRequest(d,"modify",r,e,s.parseIdentityResponse,i):(t._Helpers.invokeCallback(r,HTTPCodes$2.loggingDisabledOrMissingAPIKey,Messages$2.InformationMessages.AbandonLogEvent),t.Logger.verbose(Messages$2.InformationMessages.AbandonLogEvent));}else t._Helpers.invokeCallback(r,HTTPCodes$2.validationIssue,o.error),t.Logger.verbose(o);},/**
         * Returns a user object with methods to interact with the current user
         * @method getCurrentUser
         * @return {Object} the current user object
         */getCurrentUser:function getCurrentUser(){var e;return t._Store?(e=t._Store.mpid,e?(e=t._Store.mpid.slice(),s.mParticleUser(e,t._Store.isLoggedIn)):t._Store.webviewBridgeEnabled?s.mParticleUser():null):null},/**
         * Returns a the user object associated with the mpid parameter or 'null' if no such
         * user exists
         * @method getUser
         * @param {String} mpid of the desired user
         * @return {Object} the user for  mpid
         */getUser:function getUser(e){var r=t._Persistence.getPersistence();return r?r[e]&&!Constants.SDKv2NonMPIDCookieKeys.hasOwnProperty(e)?s.mParticleUser(e):null:null},/**
         * Returns all users, including the current user and all previous users that are stored on the device.
         * @method getUsers
         * @return {Array} array of users
         */getUsers:function getUsers(){var e=t._Persistence.getPersistence(),r=[];if(e)for(var i in e)Constants.SDKv2NonMPIDCookieKeys.hasOwnProperty(i)||r.push(s.mParticleUser(i));return r.sort(function(e,t){var s=e.getLastSeenTime()||0,r=t.getLastSeenTime()||0;return s>r?-1:1}),r},/**
         * Initiate an alias request to the mParticle server
         * @method aliasUsers
         * @param {Object} aliasRequest  object representing an AliasRequest
         * @param {Function} [callback] A callback function that is called when the aliasUsers request completes
         */aliasUsers:function aliasUsers(e,s){var r;if(e.destinationMpid&&e.sourceMpid||(r=Messages$2.ValidationMessages.AliasMissingMpid),e.destinationMpid===e.sourceMpid&&(r=Messages$2.ValidationMessages.AliasNonUniqueMpid),e.startTime&&e.endTime||(r=Messages$2.ValidationMessages.AliasMissingTime),e.startTime>e.endTime&&(r=Messages$2.ValidationMessages.AliasStartBeforeEndTime),r)return t.Logger.warning(r),void t._Helpers.invokeAliasCallback(s,HTTPCodes$2.validationIssue,r);if(!t._Helpers.canLog())t._Helpers.invokeAliasCallback(s,HTTPCodes$2.loggingDisabledOrMissingAPIKey,Messages$2.InformationMessages.AbandonAliasUsers),t.Logger.verbose(Messages$2.InformationMessages.AbandonAliasUsers);else if(t._Store.webviewBridgeEnabled)t._NativeSdkHelpers.sendToNative(Constants.NativeSdkPaths.Alias,JSON.stringify(t._Identity.IdentityRequest.convertAliasToNative(e))),t._Helpers.invokeAliasCallback(s,HTTPCodes$2.nativeIdentityRequest,"Alias request sent to native sdk");else {t.Logger.verbose(Messages$2.InformationMessages.StartingAliasRequest+": "+e.sourceMpid+" -> "+e.destinationMpid);var i=t._Identity.IdentityRequest.createAliasNetworkRequest(e);t._IdentityAPIClient.sendAliasRequest(i,s);}},/**
         Create a default AliasRequest for 2 MParticleUsers. This will construct the request
        using the sourceUser's firstSeenTime as the startTime, and its lastSeenTime as the endTime.
        
        In the unlikely scenario that the sourceUser does not have a firstSeenTime, which will only
        be the case if they have not been the current user since this functionality was added, the 
        startTime will be populated with the earliest firstSeenTime out of any stored user. Similarly,
        if the sourceUser does not have a lastSeenTime, the endTime will be populated with the current time
        
        There is a limit to how old the startTime can be, represented by the config field 'aliasMaxWindow', in days.
        If the startTime falls before the limit, it will be adjusted to the oldest allowed startTime. 
        In rare cases, where the sourceUser's lastSeenTime also falls outside of the aliasMaxWindow limit, 
        after applying this adjustment it will be impossible to create an aliasRequest passes the aliasUsers() 
        validation that the startTime must be less than the endTime 
        */createAliasRequest:function createAliasRequest(e,s){try{if(!s||!e)return t.Logger.error("'destinationUser' and 'sourceUser' must both be present"),null;var r=e.getFirstSeenTime();r||t.Identity.getUsers().forEach(function(e){e.getFirstSeenTime()&&(!r||e.getFirstSeenTime()<r)&&(r=e.getFirstSeenTime());});var i=new Date().getTime()-1e3*(60*(60*(24*t._Store.SDKConfig.aliasMaxWindow))),n=e.getLastSeenTime()||new Date().getTime();return r<i&&(r=i,n<r&&t.Logger.warning("Source User has not been seen in the last "+t._Store.SDKConfig.maxAliasWindow+" days, Alias Request will likely fail")),{destinationMpid:s.getMPID(),sourceMpid:e.getMPID(),startTime:r,endTime:n}}catch(s){return t.Logger.error("There was a problem with creating an alias request: "+s),null}}},this.mParticleUser=function(e,s){var r=this;return {/**
             * Get user identities for current user
             * @method getUserIdentities
             * @return {Object} an object with userIdentities as its key
             */getUserIdentities:function getUserIdentities(){var s={},r=t._Persistence.getUserIdentities(e);for(var i in r)r.hasOwnProperty(i)&&(s[Types.IdentityType.getIdentityName(t._Helpers.parseNumber(i))]=r[i]);return {userIdentities:s}},/**
             * Get the MPID of the current user
             * @method getMPID
             * @return {String} the current user MPID as a string
             */getMPID:function getMPID(){return e},/**
             * Sets a user tag
             * @method setUserTag
             * @param {String} tagName
             */setUserTag:function setUserTag(e){return t._Helpers.Validators.isValidKeyValue(e)?void this.setUserAttribute(e,null):void t.Logger.error(Messages$2.ErrorMessages.BadKey)},/**
             * Removes a user tag
             * @method removeUserTag
             * @param {String} tagName
             */removeUserTag:function removeUserTag(e){return t._Helpers.Validators.isValidKeyValue(e)?void this.removeUserAttribute(e):void t.Logger.error(Messages$2.ErrorMessages.BadKey)},/**
             * Sets a user attribute
             * @method setUserAttribute
             * @param {String} key
             * @param {String} value
             */setUserAttribute:function setUserAttribute(s,i){var n,o,a,d;if(t._SessionManager.resetSessionTimer(),t._Helpers.canLog()){if(!t._Helpers.Validators.isValidAttributeValue(i))return void t.Logger.error(Messages$2.ErrorMessages.BadAttribute);if(!t._Helpers.Validators.isValidKeyValue(s))return void t.Logger.error(Messages$2.ErrorMessages.BadKey);if(t._Store.webviewBridgeEnabled)t._NativeSdkHelpers.sendToNative(Constants.NativeSdkPaths.SetUserAttribute,JSON.stringify({key:s,value:i}));else {n=t._Persistence.getPersistence(),o=this.getAllUserAttributes();var g=t._Helpers.findKeyInObject(o,s);g?(d=!1,a=o[g],delete o[g]):d=!0,o[s]=i,n&&n[e]&&(n[e].ua=o,t._Persistence.savePersistence(n,e)),r.sendUserAttributeChangeEvent(s,i,a,d,!1,this),t._Forwarders.initForwarders(r.IdentityAPI.getCurrentUser().getUserIdentities(),t._APIClient.prepareForwardingStats),t._Forwarders.callSetUserAttributeOnForwarders(s,i);}}},/**
             * Set multiple user attributes
             * @method setUserAttributes
             * @param {Object} user attribute object with keys of the attribute type, and value of the attribute value
             */setUserAttributes:function setUserAttributes(e){if(t._SessionManager.resetSessionTimer(),!t._Helpers.isObject(e))t.Logger.error("Must pass an object into setUserAttributes. You passed a "+_typeof(e));else if(t._Helpers.canLog())for(var s in e)e.hasOwnProperty(s)&&this.setUserAttribute(s,e[s]);},/**
             * Removes a specific user attribute
             * @method removeUserAttribute
             * @param {String} key
             */removeUserAttribute:function removeUserAttribute(s){var i,n;if(t._SessionManager.resetSessionTimer(),!t._Helpers.Validators.isValidKeyValue(s))return void t.Logger.error(Messages$2.ErrorMessages.BadKey);if(t._Store.webviewBridgeEnabled)t._NativeSdkHelpers.sendToNative(Constants.NativeSdkPaths.RemoveUserAttribute,JSON.stringify({key:s,value:null}));else {i=t._Persistence.getPersistence(),n=this.getAllUserAttributes();var o=t._Helpers.findKeyInObject(n,s);o&&(s=o);var a=n[s]?n[s].toString():null;delete n[s],i&&i[e]&&(i[e].ua=n,t._Persistence.savePersistence(i,e)),r.sendUserAttributeChangeEvent(s,null,a,!1,!0,this),t._Forwarders.initForwarders(r.IdentityAPI.getCurrentUser().getUserIdentities(),t._APIClient.prepareForwardingStats),t._Forwarders.applyToForwarders("removeUserAttribute",s);}},/**
             * Sets a list of user attributes
             * @method setUserAttributeList
             * @param {String} key
             * @param {Array} value an array of values
             */setUserAttributeList:function setUserAttributeList(s,n){var o,a,d,g,l;if(t._SessionManager.resetSessionTimer(),!t._Helpers.Validators.isValidKeyValue(s))return void t.Logger.error(Messages$2.ErrorMessages.BadKey);if(!Array.isArray(n))return void t.Logger.error("The value you passed in to setUserAttributeList must be an array. You passed in a "+("undefined"==typeof value?"undefined":_typeof(value)));var u=n.slice();if(t._Store.webviewBridgeEnabled)t._NativeSdkHelpers.sendToNative(Constants.NativeSdkPaths.SetUserAttributeList,JSON.stringify({key:s,value:u}));else {o=t._Persistence.getPersistence(),a=this.getAllUserAttributes();var p=t._Helpers.findKeyInObject(a,s);if(p?(g=!1,d=a[p],delete a[p]):g=!0,a[s]=u,o&&o[e]&&(o[e].ua=a,t._Persistence.savePersistence(o,e)),t._APIClient.shouldEnableBatching()){// If the new attributeList length is different previous, then there is a change event.
// Loop through new attributes list, see if they are all in the same index as previous user attributes list
// If there are any changes, break, and immediately send a userAttributeChangeEvent with full array as a value
if(!d||!Array.isArray(d))l=!0;else if(n.length!==d.length)l=!0;else for(var c=0;c<n.length;c++)if(d[c]!==n[c]){l=!0;break}l&&r.sendUserAttributeChangeEvent(s,n,d,g,!1,this);}t._Forwarders.initForwarders(r.IdentityAPI.getCurrentUser().getUserIdentities(),t._APIClient.prepareForwardingStats),t._Forwarders.callSetUserAttributeOnForwarders(s,u);}},/**
             * Removes all user attributes
             * @method removeAllUserAttributes
             */removeAllUserAttributes:function removeAllUserAttributes(){var e;if(t._SessionManager.resetSessionTimer(),t._Store.webviewBridgeEnabled)t._NativeSdkHelpers.sendToNative(Constants.NativeSdkPaths.RemoveAllUserAttributes);else if(e=this.getAllUserAttributes(),t._Forwarders.initForwarders(r.IdentityAPI.getCurrentUser().getUserIdentities(),t._APIClient.prepareForwardingStats),e)for(var s in e)e.hasOwnProperty(s)&&t._Forwarders.applyToForwarders("removeUserAttribute",s),this.removeUserAttribute(s);},/**
             * Returns all user attribute keys that have values that are arrays
             * @method getUserAttributesLists
             * @return {Object} an object of only keys with array values. Example: { attr1: [1, 2, 3], attr2: ['a', 'b', 'c'] }
             */getUserAttributesLists:function getUserAttributesLists(){var e,t={};for(var s in e=this.getAllUserAttributes(),e)e.hasOwnProperty(s)&&Array.isArray(e[s])&&(t[s]=e[s].slice());return t},/**
             * Returns all user attributes
             * @method getAllUserAttributes
             * @return {Object} an object of all user attributes. Example: { attr1: 'value1', attr2: ['a', 'b', 'c'] }
             */getAllUserAttributes:function getAllUserAttributes(){var s={},r=t._Persistence.getAllUserAttributes(e);if(r)for(var i in r)r.hasOwnProperty(i)&&(s[i]=Array.isArray(r[i])?r[i].slice():r[i]);return s},/**
             * Returns the cart object for the current user
             * @method getCart
             * @return a cart object
             */getCart:function getCart(){return t.Logger.warning("Deprecated function Identity.getCurrentUser().getCart() will be removed in future releases"),r.mParticleUserCart(e)},/**
             * Returns the Consent State stored locally for this user.
             * @method getConsentState
             * @return a ConsentState object
             */getConsentState:function getConsentState(){return t._Persistence.getConsentState(e)},/**
             * Sets the Consent State stored locally for this user.
             * @method setConsentState
             * @param {Object} consent state
             */setConsentState:function setConsentState(s){t._Persistence.saveUserConsentStateToCookies(e,s),t._Forwarders.initForwarders(this.getUserIdentities().userIdentities,t._APIClient.prepareForwardingStats),t._CookieSyncManager.attemptCookieSync(null,this.getMPID());},isLoggedIn:function isLoggedIn(){return s},getLastSeenTime:function getLastSeenTime(){return t._Persistence.getLastSeenTime(e)},getFirstSeenTime:function getFirstSeenTime(){return t._Persistence.getFirstSeenTime(e)}}},this.mParticleUserCart=function(e){return {/**
             * Adds a cart product to the user cart
             * @method add
             * @param {Object} product the product
             * @param {Boolean} [logEvent] a boolean to log adding of the cart object. If blank, no logging occurs.
             * @deprecated
             */add:function add(s,r){t.Logger.warning("Deprecated function Identity.getCurrentUser().getCart().add() will be removed in future releases");var i,n,o;if(o=Array.isArray(s)?s.slice():[s],o.forEach(function(e){e.Attributes=t._Helpers.sanitizeAttributes(e.Attributes);}),t._Store.webviewBridgeEnabled)t._NativeSdkHelpers.sendToNative(Constants.NativeSdkPaths.AddToCart,JSON.stringify(o));else {t._SessionManager.resetSessionTimer(),n=t._Persistence.getUserProductsFromLS(e),n=n.concat(o),!0===r&&t._Events.logProductActionEvent(Types.ProductActionType.AddToCart,o);n.length>t._Store.SDKConfig.maxProducts&&(t.Logger.verbose("The cart contains "+n.length+" items. Only "+t._Store.SDKConfig.maxProducts+" can currently be saved in cookies."),n=n.slice(-t._Store.SDKConfig.maxProducts)),i=t._Persistence.getAllUserProductsFromLS(),i[e].cp=n,t._Persistence.setCartProducts(i);}},/**
             * Removes a cart product from the current user cart
             * @method remove
             * @param {Object} product the product
             * @param {Boolean} [logEvent] a boolean to log adding of the cart object. If blank, no logging occurs.
             * @deprecated
             */remove:function remove(s,r){t.Logger.warning("Deprecated function Identity.getCurrentUser().getCart().remove() will be removed in future releases");var i,n,o=-1,a=null;if(t._Store.webviewBridgeEnabled)t._NativeSdkHelpers.sendToNative(Constants.NativeSdkPaths.RemoveFromCart,JSON.stringify(s));else {t._SessionManager.resetSessionTimer(),n=t._Persistence.getUserProductsFromLS(e),n&&(n.forEach(function(e,t){e.Sku===s.Sku&&(o=t,a=e);}),-1<o&&(n.splice(o,1),!0===r&&t._Events.logProductActionEvent(Types.ProductActionType.RemoveFromCart,a)));i=t._Persistence.getAllUserProductsFromLS(),i[e].cp=n,t._Persistence.setCartProducts(i);}},/**
             * Clears the user's cart
             * @method clear
             * @deprecated
             */clear:function clear(){t.Logger.warning("Deprecated function Identity.getCurrentUser().getCart().clear() will be removed in future releases");var s;t._Store.webviewBridgeEnabled?t._NativeSdkHelpers.sendToNative(Constants.NativeSdkPaths.ClearCart):(t._SessionManager.resetSessionTimer(),s=t._Persistence.getAllUserProductsFromLS(),s&&s[e]&&s[e].cp&&(s[e].cp=[],s[e].cp=[],t._Persistence.setCartProducts(s)));},/**
             * Returns all cart products
             * @method getCartProducts
             * @return {Array} array of cart products
             * @deprecated
             */getCartProducts:function getCartProducts(){return t.Logger.warning("Deprecated function Identity.getCurrentUser().getCart().getCartProducts() will be removed in future releases"),t._Persistence.getCartProducts(e)}}},this.parseIdentityResponse=function(r,i,n,o,a){var d,g,l,u,p=t.Identity.getUser(i),c={},y=p?p.getUserIdentities().userIdentities:{},I=t._Helpers.extend({},y);t._Store.identityCallInFlight=!1;try{if(t.Logger.verbose("Parsing \""+a+"\" identity response from server"),r.responseText&&(l=JSON.parse(r.responseText),l.hasOwnProperty("is_logged_in")&&(t._Store.isLoggedIn=l.is_logged_in)),(!p||p.getMPID()&&l.mpid&&l.mpid!==p.getMPID())&&(t._Store.mpid=l.mpid,p&&t._Persistence.setLastSeenTime(i),!t._Persistence.getFirstSeenTime(l.mpid)&&(g=!0),t._Persistence.setFirstSeenTime(l.mpid)),200===r.status){if("modify"===a)c=t._Identity.IdentityRequest.combineUserIdentities(y,o.userIdentities),t._Persistence.saveUserIdentitiesToPersistence(i,c);else {var _=s.IdentityAPI.getUser(l.mpid),v=_?_.getUserIdentities().userIdentities:{},m=t._Helpers.extend({},v);//if there is any previous migration data
if(t.Logger.verbose("Successfully parsed Identity Response"),"identify"==a&&p&&l.mpid===p.getMPID()&&t._Persistence.setFirstSeenTime(l.mpid),u=t._Store.currentSessionMPIDs.indexOf(l.mpid),t._Store.sessionId&&l.mpid&&i!==l.mpid&&0>u&&t._Store.currentSessionMPIDs.push(l.mpid),-1<u&&(t._Store.currentSessionMPIDs=t._Store.currentSessionMPIDs.slice(0,u).concat(t._Store.currentSessionMPIDs.slice(u+1,t._Store.currentSessionMPIDs.length)),t._Store.currentSessionMPIDs.push(l.mpid)),t._CookieSyncManager.attemptCookieSync(i,l.mpid,g),s.checkIdentitySwap(i,l.mpid,t._Store.currentSessionMPIDs),Object.keys(t._Store.migrationData).length){c=t._Store.migrationData.userIdentities||{};var S=t._Store.migrationData.userAttributes||{};t._Persistence.saveUserAttributesToPersistence(l.mpid,S);}else o&&o.userIdentities&&Object.keys(o.userIdentities).length&&(c=s.IdentityRequest.combineUserIdentities(v,o.userIdentities));t._Persistence.saveUserIdentitiesToPersistence(l.mpid,c),t._Persistence.update(),t._Persistence.findPrevCookiesBasedOnUI(o),t._Store.context=l.context||t._Store.context;}if(d=t.Identity.getCurrentUser(),o&&o.onUserAlias&&t._Helpers.Validators.isFunction(o.onUserAlias))try{t.Logger.warning("Deprecated function onUserAlias will be removed in future releases"),o.onUserAlias(p,d);}catch(s){t.Logger.error("There was an error with your onUserAlias function - "+s);}var P=t._Persistence.getPersistence();d&&(t._Persistence.storeDataInMemory(P,d.getMPID()),(!p||d.getMPID()!==p.getMPID()||p.isLoggedIn()!==d.isLoggedIn())&&t._Forwarders.initForwarders(d.getUserIdentities().userIdentities,t._APIClient.prepareForwardingStats),t._Forwarders.setForwarderUserIdentities(d.getUserIdentities().userIdentities),t._Forwarders.setForwarderOnIdentityComplete(d,a),t._Forwarders.setForwarderOnUserIdentified(d,a));var b={};for(var A in c)b[Types.IdentityType.getIdentityName(t._Helpers.parseNumber(A))]=c[A];s.sendUserIdentityChangeEvent(b,a,l.mpid,"modify"===a?I:m);}n?0===r.status?t._Helpers.invokeCallback(n,HTTPCodes$2.noHttpCoverage,l||null,d):t._Helpers.invokeCallback(n,r.status,l||null,d):l&&l.errors&&l.errors.length&&t.Logger.error("Received HTTP response code of "+r.status+" - "+l.errors[0].message),t._APIClient.processQueuedEvents();}catch(s){n&&t._Helpers.invokeCallback(n,r.status,l||null),t.Logger.error("Error parsing JSON response from Identity server: "+s);}},this.sendUserIdentityChangeEvent=function(e,r,i,n){var o,a;if(t._APIClient.shouldEnableBatching()&&(i||"modify"===r))for(var d in o=this.IdentityAPI.getUser(i),e)if(n[d]!==e[d]){var g=!n[d];a=s.createUserIdentityChange(d,e[d],n[d],g,o),t._APIClient.sendEventToServer(a);}},this.createUserIdentityChange=function(e,s,r,i,n){var o;return o=t._ServerModel.createEventObject({messageType:Types.MessageType.UserIdentityChange,userIdentityChanges:{New:{IdentityType:e,Identity:s,CreatedThisBatch:i},Old:{IdentityType:e,Identity:r,CreatedThisBatch:!1}},userInMemory:n}),o},this.sendUserAttributeChangeEvent=function(e,r,i,n,o,a){if(t._APIClient.shouldEnableBatching()){var d=s.createUserAttributeChange(e,r,i,n,o,a);d&&t._APIClient.sendEventToServer(d);}},this.createUserAttributeChange=function(e,s,r,i,n,o){r||(r=null);var a;return s!==r&&(a=t._ServerModel.createEventObject({messageType:Types.MessageType.UserAttributeChange,userAttributeChanges:{UserAttributeName:e,New:s,Old:r||null,Deleted:n,IsNewAttribute:i}},o)),a};}

function Consent(a){var b=this,c="data_sale_opt_out";// this function is called when consent is required to determine if a cookie sync should happen, or a forwarder should be initialized
this.isEnabledForUserConsent=function(b,c){if(!b||!b.values||!b.values.length)return !0;if(!c)return !1;var d,e={},f=c.getConsentState();if(f){// the server hashes consent purposes in the following way:
// GDPR - '1' + purpose name
// CCPA - '2data_sale_opt_out' (there is only 1 purpose of data_sale_opt_out for CCPA)
var g=f.getGDPRConsentState();if(g)for(var h in g)g.hasOwnProperty(h)&&(d=a._Helpers.generateHash("1"+h).toString(),e[d]=g[h].Consented);var i=f.getCCPAConsentState();i&&(d=a._Helpers.generateHash("2"+"data_sale_opt_out").toString(),e[d]=i.Consented);}var j=b.values.some(function(a){var b=a.consentPurpose,c=a.hasConsented;if(e.hasOwnProperty(b))return e[b]===c});return b.includeOnMatch===j},this.createPrivacyConsent=function(b,c,d,e,f){return "boolean"==typeof b?c&&isNaN(c)?(a.Logger.error("Timestamp must be a valid number when constructing a Consent object."),null):d&&"string"!=typeof d?(a.Logger.error("Document must be a valid string when constructing a Consent object."),null):e&&"string"!=typeof e?(a.Logger.error("Location must be a valid string when constructing a Consent object."),null):f&&"string"!=typeof f?(a.Logger.error("Hardware ID must be a valid string when constructing a Consent object."),null):{Consented:b,Timestamp:c||Date.now(),ConsentDocument:d,Location:e,HardwareId:f}:(a.Logger.error("Consented boolean is required when constructing a Consent object."),null)},this.ConsentSerialization={toMinifiedJsonObject:function toMinifiedJsonObject(a){var b={};if(a){var d=a.getGDPRConsentState();if(d)for(var e in b.gdpr={},d)if(d.hasOwnProperty(e)){var f=d[e];b.gdpr[e]={},"boolean"==typeof f.Consented&&(b.gdpr[e].c=f.Consented),"number"==typeof f.Timestamp&&(b.gdpr[e].ts=f.Timestamp),"string"==typeof f.ConsentDocument&&(b.gdpr[e].d=f.ConsentDocument),"string"==typeof f.Location&&(b.gdpr[e].l=f.Location),"string"==typeof f.HardwareId&&(b.gdpr[e].h=f.HardwareId);}var g=a.getCCPAConsentState();g&&(b.ccpa={},b.ccpa[c]={},"boolean"==typeof g.Consented&&(b.ccpa[c].c=g.Consented),"number"==typeof g.Timestamp&&(b.ccpa[c].ts=g.Timestamp),"string"==typeof g.ConsentDocument&&(b.ccpa[c].d=g.ConsentDocument),"string"==typeof g.Location&&(b.ccpa[c].l=g.Location),"string"==typeof g.HardwareId&&(b.ccpa[c].h=g.HardwareId));}return b},fromMinifiedJsonObject:function fromMinifiedJsonObject(a){var d=b.createConsentState();if(a.gdpr)for(var e in a.gdpr)if(a.gdpr.hasOwnProperty(e)){var f=b.createPrivacyConsent(a.gdpr[e].c,a.gdpr[e].ts,a.gdpr[e].d,a.gdpr[e].l,a.gdpr[e].h);d.addGDPRConsentState(e,f);}if(a.ccpa&&a.ccpa.hasOwnProperty(c)){var g=b.createPrivacyConsent(a.ccpa[c].c,a.ccpa[c].ts,a.ccpa[c].d,a.ccpa[c].l,a.ccpa[c].h);d.setCCPAConsentState(g);}return d}},this.createConsentState=function(d){function e(a){if("string"!=typeof a)return null;var b=a.trim();return b.length?b.toLowerCase():null}/**
         * Invoke these methods on a consent state object.
         * <p>
         * Usage: var consent = mParticle.Consent.createConsentState()
         * <br>
         * consent.setGDPRCoonsentState()
         *
         * @class Consent
         */ /**
         * Add a GDPR Consent State to the consent state object
         *
         * @method addGDPRConsentState
         * @param purpose [String] Data processing purpose that describes the type of processing done on the data subject’s data
         * @param gdprConsent [Object] A GDPR consent object created via mParticle.Consent.createGDPRConsent(...)
         */function f(c,d){var f=e(c);if(!f)return a.Logger.error("Purpose must be a string."),this;if(!a._Helpers.isObject(d))return a.Logger.error("Invoked with a bad or empty consent object."),this;var g=b.createPrivacyConsent(d.Consented,d.Timestamp,d.ConsentDocument,d.Location,d.HardwareId);return g&&(l[f]=g),this}function g(b){if(!b)l={};else if(a._Helpers.isObject(b))for(var c in l={},b)b.hasOwnProperty(c)&&f(c,b[c]);return this}/**
         * Remove a GDPR Consent State to the consent state object
         *
         * @method removeGDPRConsentState
         * @param purpose [String] Data processing purpose that describes the type of processing done on the data subject’s data
         */function h(a){var b=e(a);return b?(delete l[b],this):this}/**
         * Gets the GDPR Consent State
         *
         * @method getGDPRConsentState
         * @return {Object} A GDPR Consent State
         */function i(){return a._Helpers.extend({},l)}/**
         * Sets a CCPA Consent state (has a single purpose of 'data_sale_opt_out')
         *
         * @method setCCPAConsentState
         * @param {Object} ccpaConsent CCPA Consent State
         */function j(d){if(!a._Helpers.isObject(d))return a.Logger.error("Invoked with a bad or empty CCPA consent object."),this;var e=b.createPrivacyConsent(d.Consented,d.Timestamp,d.ConsentDocument,d.Location,d.HardwareId);return e&&(m[c]=e),this}/**
         * Gets the CCPA Consent State
         *
         * @method getCCPAConsentStatensent
         * @return {Object} A CCPA Consent State
         */ /**
         * Removes CCPA from the consent state object
         *
         * @method removeCCPAConsentState
         */function k(){return delete m[c],this}var l={},m={};return d&&(g(d.getGDPRConsentState()),j(d.getCCPAConsentState())),{setGDPRConsentState:g,addGDPRConsentState:f,setCCPAConsentState:j,getCCPAConsentState:function a(){return m[c]},getGDPRConsentState:i,removeGDPRConsentState:h,removeCCPAState:function b(){return a.Logger.warning("removeCCPAState is deprecated and will be removed in a future release; use removeCCPAConsentState instead"),k()},removeCCPAConsentState:k}};}

/*
    TODO: Including this as a workaround because attempting to import it from
    @mparticle/data-planning-models directly creates a build error.
 */var DataPlanMatchType={ScreenView:"screen_view",CustomEvent:"custom_event",Commerce:"commerce",UserAttributes:"user_attributes",UserIdentities:"user_identities",ProductAction:"product_action",PromotionAction:"promotion_action",ProductImpression:"product_impression"},KitBlocker=/** @class */function(){function a(a,b){var c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r=this;// if data plan is not requested, the data plan is {document: null}
if(this.dataPlanMatchLookups={},this.blockEvents=!1,this.blockEventAttributes=!1,this.blockUserAttributes=!1,this.blockUserIdentities=!1,this.kitBlockingEnabled=!1,a&&!a.document)return void(this.kitBlockingEnabled=!1);this.kitBlockingEnabled=!0,this.mpInstance=b,this.blockEvents=null===(e=null===(d=null===(c=null===a||void 0===a?void 0:a.document)||void 0===c?void 0:c.dtpn)||void 0===d?void 0:d.blok)||void 0===e?void 0:e.ev,this.blockEventAttributes=null===(h=null===(g=null===(f=null===a||void 0===a?void 0:a.document)||void 0===f?void 0:f.dtpn)||void 0===g?void 0:g.blok)||void 0===h?void 0:h.ea,this.blockUserAttributes=null===(k=null===(j=null===(i=null===a||void 0===a?void 0:a.document)||void 0===i?void 0:i.dtpn)||void 0===j?void 0:j.blok)||void 0===k?void 0:k.ua,this.blockUserIdentities=null===(n=null===(m=null===(l=null===a||void 0===a?void 0:a.document)||void 0===l?void 0:l.dtpn)||void 0===m?void 0:m.blok)||void 0===n?void 0:n.id;var s=null===(q=null===(p=null===(o=null===a||void 0===a?void 0:a.document)||void 0===o?void 0:o.dtpn)||void 0===p?void 0:p.vers)||void 0===q?void 0:q.version_document,t=null===s||void 0===s?void 0:s.data_points;if(s)try{0<(null===t||void 0===t?void 0:t.length)&&t.forEach(function(a){return r.addToMatchLookups(a)});}catch(a){this.mpInstance.Logger.error("There was an issue with the data plan: "+a);}}return a.prototype.addToMatchLookups=function(a){var b,c,d;if(!a.match||!a.validator)return void this.mpInstance.Logger.warning("Data Plan Point is not valid' + ".concat(a));// match keys for non product custom attribute related data points
var e=this.generateMatchKey(a.match),f=this.getPlannedProperties(a.match.type,a.validator);this.dataPlanMatchLookups[e]=f,((null===(b=null===a||void 0===a?void 0:a.match)||void 0===b?void 0:b.type)===DataPlanMatchType.ProductImpression||(null===(c=null===a||void 0===a?void 0:a.match)||void 0===c?void 0:c.type)===DataPlanMatchType.ProductAction||(null===(d=null===a||void 0===a?void 0:a.match)||void 0===d?void 0:d.type)===DataPlanMatchType.PromotionAction)&&(e=this.generateProductAttributeMatchKey(a.match),f=this.getProductProperties(a.match.type,a.validator),this.dataPlanMatchLookups[e]=f);},a.prototype.generateMatchKey=function(a){var b=a.criteria||"";switch(a.type){case DataPlanMatchType.CustomEvent:var c=b;return [DataPlanMatchType.CustomEvent,c.custom_event_type,c.event_name].join(":");case DataPlanMatchType.ScreenView:return [DataPlanMatchType.ScreenView,"",b.screen_name].join(":");case DataPlanMatchType.ProductAction:return [a.type,b.action].join(":");case DataPlanMatchType.PromotionAction:return [a.type,b.action].join(":");case DataPlanMatchType.ProductImpression:return [a.type,b.action].join(":");case DataPlanMatchType.UserIdentities:case DataPlanMatchType.UserAttributes:return [a.type].join(":");default:return null;}},a.prototype.generateProductAttributeMatchKey=function(a){var b=a.criteria||"";switch(a.type){case DataPlanMatchType.ProductAction:return [a.type,b.action,"ProductAttributes"].join(":");case DataPlanMatchType.PromotionAction:return [a.type,b.action,"ProductAttributes"].join(":");case DataPlanMatchType.ProductImpression:return [a.type,"ProductAttributes"].join(":");default:return null;}},a.prototype.getPlannedProperties=function(a,b){var c,d,e,f,g,h,i,j,k,l;switch(a){case DataPlanMatchType.CustomEvent:case DataPlanMatchType.ScreenView:case DataPlanMatchType.ProductAction:case DataPlanMatchType.PromotionAction:case DataPlanMatchType.ProductImpression:if(k=null===(f=null===(e=null===(d=null===(c=null===b||void 0===b?void 0:b.definition)||void 0===c?void 0:c.properties)||void 0===d?void 0:d.data)||void 0===e?void 0:e.properties)||void 0===f?void 0:f.custom_attributes,k){if(!0===k.additionalProperties||void 0===k.additionalProperties)return !0;for(var m,n={},o=0,p=Object.keys(k.properties);o<p.length;o++)m=p[o],n[m]=!0;return n}return !1!==(null===(i=null===(h=null===(g=null===b||void 0===b?void 0:b.definition)||void 0===g?void 0:g.properties)||void 0===h?void 0:h.data)||void 0===i?void 0:i.additionalProperties)||{};case DataPlanMatchType.UserAttributes:case DataPlanMatchType.UserIdentities:if(l=null===(j=null===b||void 0===b?void 0:b.definition)||void 0===j?void 0:j.additionalProperties,!0===l||void 0===l)return !0;for(var m,n={},q=b.definition.properties,r=0,s=Object.keys(q);r<s.length;r++)m=s[r],n[m]=!0;return n;default:return null;}},a.prototype.getProductProperties=function(a,b){var c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v;switch(a){case DataPlanMatchType.ProductImpression://product item attributes
if(v=null===(l=null===(k=null===(j=null===(i=null===(h=null===(g=null===(f=null===(e=null===(d=null===(c=null===b||void 0===b?void 0:b.definition)||void 0===c?void 0:c.properties)||void 0===d?void 0:d.data)||void 0===e?void 0:e.properties)||void 0===f?void 0:f.product_impressions)||void 0===g?void 0:g.items)||void 0===h?void 0:h.properties)||void 0===i?void 0:i.products)||void 0===j?void 0:j.items)||void 0===k?void 0:k.properties)||void 0===l?void 0:l.custom_attributes,!1===(null===v||void 0===v?void 0:v.additionalProperties)){for(var w,x={},y=0,z=Object.keys(null===v||void 0===v?void 0:v.properties);y<z.length;y++)w=z[y],x[w]=!0;return x}return !0;case DataPlanMatchType.ProductAction:case DataPlanMatchType.PromotionAction://product item attributes
if(v=null===(u=null===(t=null===(s=null===(r=null===(q=null===(p=null===(o=null===(n=null===(m=null===b||void 0===b?void 0:b.definition)||void 0===m?void 0:m.properties)||void 0===n?void 0:n.data)||void 0===o?void 0:o.properties)||void 0===p?void 0:p.product_action)||void 0===q?void 0:q.properties)||void 0===r?void 0:r.products)||void 0===s?void 0:s.items)||void 0===t?void 0:t.properties)||void 0===u?void 0:u.custom_attributes,v&&!1===v.additionalProperties){for(var w,x={},A=0,B=Object.keys(null===v||void 0===v?void 0:v.properties);A<B.length;A++)w=B[A],x[w]=!0;return x}return !0;default:return null;}},a.prototype.getMatchKey=function(a){switch(a.event_type){case dist.EventTypeEnum.screenView:var b=a;return b.data?["screen_view","",b.data.screen_name].join(":"):null;case dist.EventTypeEnum.commerceEvent:var c=a,d=[];if(c&&c.data){var e=c.data,f=e.product_action,g=e.product_impressions,h=e.promotion_action;f?(d.push(DataPlanMatchType.ProductAction),d.push(f.action)):h?(d.push(DataPlanMatchType.PromotionAction),d.push(h.action)):g&&d.push(DataPlanMatchType.ProductImpression);}return d.join(":");case dist.EventTypeEnum.customEvent:var i=a;return i.data?["custom_event",i.data.custom_event_type,i.data.event_name].join(":"):null;default:return null;}},a.prototype.getProductAttributeMatchKey=function(a){switch(a.event_type){case dist.EventTypeEnum.commerceEvent:var b=[],c=a.data,d=c.product_action,e=c.product_impressions,f=c.promotion_action;return d?(b.push(DataPlanMatchType.ProductAction),b.push(d.action),b.push("ProductAttributes")):f?(b.push(DataPlanMatchType.PromotionAction),b.push(f.action),b.push("ProductAttributes")):e&&(b.push(DataPlanMatchType.ProductImpression),b.push("ProductAttributes")),b.join(":");default:return null;}},a.prototype.createBlockedEvent=function(a){/*
            return a transformed event based on event/event attributes,
            then product attributes if applicable, then user attributes,
            then the user identities
        */try{return a&&(a=this.transformEventAndEventAttributes(a)),a&&a.EventDataType===Types.MessageType.Commerce&&(a=this.transformProductAttributes(a)),a&&(a=this.transformUserAttributes(a),a=this.transformUserIdentities(a)),a}catch(b){return a}},a.prototype.transformEventAndEventAttributes=function(a){var b=__assign({},a),c=convertEvent(b),d=this.getMatchKey(c),e=this.dataPlanMatchLookups[d];if(this.blockEvents&&!e)/*
                If the event is not planned, it doesn't exist in dataPlanMatchLookups
                and should be blocked (return null to not send anything to forwarders)
            */return null;if(this.blockEventAttributes){/*
                matchedEvent is set to `true` if additionalProperties is `true`
                otherwise, delete attributes that exist on event.EventAttributes
                that aren't on
            */if(!0===e)return b;if(e){for(var f,g=0,h=Object.keys(b.EventAttributes);g<h.length;g++)f=h[g],e[f]||delete b.EventAttributes[f];return b}return b}return b},a.prototype.transformProductAttributes=function(a){function b(a,b){b.forEach(function(b){for(var c,d=0,e=Object.keys(b.Attributes);d<e.length;d++)c=e[d],a[c]||delete b.Attributes[c];});}var c,d=__assign({},a),e=convertEvent(d),f=this.getProductAttributeMatchKey(e),g=this.dataPlanMatchLookups[f];if(this.blockEvents&&!g)/*
                If the event is not planned, it doesn't exist in dataPlanMatchLookups
                and should be blocked (return null to not send anything to forwarders)
            */return null;if(this.blockEventAttributes){/*
                matchedEvent is set to `true` if additionalProperties is `true`
                otherwise, delete attributes that exist on event.EventAttributes
                that aren't on
            */if(!0===g)return d;if(g){switch(a.EventCategory){case Types.CommerceEventType.ProductImpression:d.ProductImpressions.forEach(function(a){b(g,null===a||void 0===a?void 0:a.ProductList);});break;case Types.CommerceEventType.ProductPurchase:b(g,null===(c=d.ProductAction)||void 0===c?void 0:c.ProductList);break;default:this.mpInstance.Logger.warning("Product Not Supported ");}return d}return d}return d},a.prototype.transformUserAttributes=function(a){var b=__assign({},a);if(this.blockUserAttributes){/*
                If the user attribute is not found in the matchedAttributes
                then remove it from event.UserAttributes as it is blocked
            */var c=this.dataPlanMatchLookups.user_attributes;if(this.mpInstance._Helpers.isObject(c))for(var d,e=0,f=Object.keys(b.UserAttributes);e<f.length;e++)d=f[e],c[d]||delete b.UserAttributes[d];}return b},a.prototype.isAttributeKeyBlocked=function(a){/* used when an attribute is added to the user */if(!this.blockUserAttributes)return !1;if(this.blockUserAttributes){var b=this.dataPlanMatchLookups.user_attributes;if(!0===b)return !1;if(!b[a])return !0}return !1},a.prototype.isIdentityBlocked=function(a){/* used when an attribute is added to the user */if(!this.blockUserIdentities)return !1;if(this.blockUserIdentities){var b=this.dataPlanMatchLookups.user_identities;if(!0===b)return !1;if(!b[a])return !0}else return !1;return !1},a.prototype.transformUserIdentities=function(a){var b,c=this,d=__assign({},a);if(this.blockUserIdentities){var e=this.dataPlanMatchLookups.user_identities;this.mpInstance._Helpers.isObject(e)&&(null===(b=null===d||void 0===d?void 0:d.UserIdentities)||void 0===b?void 0:b.length)&&d.UserIdentities.forEach(function(a,b){var f=Types.IdentityType.getIdentityName(c.mpInstance._Helpers.parseNumber(a.Type));e[f]||d.UserIdentities.splice(b,1);});}return d},a}();

function ConfigAPIClient(){this.getSDKConfiguration=function(a,b,c,d){var e;try{var f=function xhrCallback(){4===g.readyState&&(200===g.status?(b=d._Helpers.extend({},b,JSON.parse(g.responseText)),c(a,b,d),d.Logger.verbose("Successfully received configuration from server")):(c(a,b,d),d.Logger.verbose("Issue with receiving configuration from server, received HTTP Code of "+g.status)));},g=d._Helpers.createXHR(f);e="https://"+d._Store.SDKConfig.configUrl+a+"/config?env=",e+=b.isDevelopmentMode?"1":"0";var h=b.dataPlan;h&&(h.planId&&(e=e+"&plan_id="+h.planId||""),h.planVersion&&(e=e+"&plan_version="+h.planVersion||"")),g&&(g.open("get",e),g.send(null));}catch(f){c(a,b,d),d.Logger.error("Error getting forwarder configuration from mParticle servers.");}};}

var HTTPCodes$1=Constants.HTTPCodes,Messages$1=Constants.Messages;function IdentityAPIClient(a){this.sendAliasRequest=function(b,c){var d,e=function xhrCallback(){if(4===d.readyState){//only parse error messages from failing requests
if(a.Logger.verbose("Received "+d.statusText+" from server"),200!==d.status&&202!==d.status&&d.responseText){var b=JSON.parse(d.responseText);if(b.hasOwnProperty("message")){var e=b.message;return void a._Helpers.invokeAliasCallback(c,d.status,e)}}a._Helpers.invokeAliasCallback(c,d.status);}};if(a.Logger.verbose(Messages$1.InformationMessages.SendAliasHttp),d=a._Helpers.createXHR(e),d)try{d.open("post",a._Helpers.createServiceUrl(a._Store.SDKConfig.aliasUrl,a._Store.devToken)+"/Alias"),d.send(JSON.stringify(b));}catch(b){a._Helpers.invokeAliasCallback(c,HTTPCodes$1.noHttpCoverage,b),a.Logger.error("Error sending alias request to mParticle servers. "+b);}},this.sendIdentityRequest=function(b,c,d,e,f,g){var h,i,j=function xhrCallback(){4===h.readyState&&(a.Logger.verbose("Received "+h.statusText+" from server"),f(h,i,d,e,c));};if(a.Logger.verbose(Messages$1.InformationMessages.SendIdentityBegin),!b)return void a.Logger.error(Messages$1.ErrorMessages.APIRequestEmpty);if(a.Logger.verbose(Messages$1.InformationMessages.SendIdentityHttp),h=a._Helpers.createXHR(j),h)try{a._Store.identityCallInFlight?a._Helpers.invokeCallback(d,HTTPCodes$1.activeIdentityRequest,"There is currently an Identity request processing. Please wait for this to return before requesting again"):(i=g||null,"modify"===c?h.open("post",a._Helpers.createServiceUrl(a._Store.SDKConfig.identityUrl)+g+"/"+c):h.open("post",a._Helpers.createServiceUrl(a._Store.SDKConfig.identityUrl)+c),h.setRequestHeader("Content-Type","application/json"),h.setRequestHeader("x-mp-key",a._Store.devToken),a._Store.identityCallInFlight=!0,h.send(JSON.stringify(b)));}catch(b){a._Store.identityCallInFlight=!1,a._Helpers.invokeCallback(d,HTTPCodes$1.noHttpCoverage,b),a.Logger.error("Error sending identity request to servers with status code "+h.status+" - "+b);}};}

var Messages=Constants.Messages,HTTPCodes=Constants.HTTPCodes;/**
 * <p>All of the following methods can be called on the primary mParticle class. In version 2.10.0, we introduced <a href="https://docs.mparticle.com/developers/sdk/web/multiple-instances/">multiple instances</a>. If you are using multiple instances (self hosted environments only), you should call these methods on each instance.</p>
 * <p>In current versions of mParticle, if your site has one instance, that instance name is 'default_instance'. Any methods called on mParticle on a site with one instance will be mapped to the `default_instance`.</p>
 * <p>This is for simplicity and backwards compatibility. For example, calling mParticle.logPageView() automatically maps to mParticle.getInstance('default_instance').logPageView().</p>
 * <p>If you have multiple instances, instances must first be initialized and then a method can be called on that instance. For example:</p>
 * <code>
 *  mParticle.init('apiKey', config, 'another_instance');
 *  mParticle.getInstance('another_instance').logPageView();
 * </code>
 *
 * @class mParticle & mParticleInstance
 */function mParticleInstance(a){var b=this;// These classes are for internal use only. Not documented for public consumption
// required for forwarders once they reference the mparticle instance
/**
     * Resets the SDK to an uninitialized state and removes cookies/localStorage. You MUST call mParticle.init(apiKey, window.mParticle.config)
     * before any other mParticle methods or the SDK will not function as intended.
     * @method setLogLevel
     * @param {String} logLevel verbose, warning, or none. By default, `warning` is chosen.
     */ /**
     * Resets the SDK to an uninitialized state and removes cookies/localStorage. You MUST call mParticle.init(apiKey, window.mParticle.config)
     * before any other mParticle methods or the SDK will not function as intended.
     * @method reset
     */ /**
     * A callback method that is invoked after mParticle is initialized.
     * @method ready
     * @param {Function} function A function to be called after mParticle is initialized
     */ /**
     * Returns the mParticle SDK version number
     * @method getVersion
     * @return {String} mParticle SDK version number
     */ /**
     * Sets the app version
     * @method setAppVersion
     * @param {String} version version number
     */ /**
     * Sets the device id
     * @method setDeviceId
     * @param {String} name device ID (UUIDv4-formatted string)
     */ /**
     * Returns a boolean for whether or not the SDKhas been fully initialized
     * @method isInitialized
     * @return {Boolean} a boolean for whether or not the SDK has been fully initialized
     */ /**
     * Gets the app name
     * @method getAppName
     * @return {String} App name
     */ /**
     * Sets the app name
     * @method setAppName
     * @param {String} name App Name
     */ /**
     * Gets the app version
     * @method getAppVersion
     * @return {String} App version
     */ /**
     * Stops tracking the location of the user
     * @method stopTrackingLocation
     */ /**
     * Starts tracking the location of the user
     * @method startTrackingLocation
     * @param {Function} [callback] A callback function that is called when the location is either allowed or rejected by the user. A position object of schema {coords: {latitude: number, longitude: number}} is passed to the callback
     */ /**
     * Sets the position of the user
     * @method setPosition
     * @param {Number} lattitude lattitude digit
     * @param {Number} longitude longitude digit
     */ /**
     * Starts a new session
     * @method startNewSession
     */ /**
     * Ends the current session
     * @method endSession
     */ /**
     * Logs a Base Event to mParticle's servers
     * @param {Object} event Base Event Object
     * @param {Object} [eventOptions] For Event-level Configuration Options
     */ /**
     * Logs an event to mParticle's servers
     * @method logEvent
     * @param {String} eventName The name of the event
     * @param {Number} [eventType] The eventType as seen [here](http://docs.mparticle.com/developers/sdk/web/event-tracking#event-type)
     * @param {Object} [eventInfo] Attributes for the event
     * @param {Object} [customFlags] Additional customFlags
     * @param {Object} [eventOptions] For Event-level Configuration Options
     */ /**
     * Used to log custom errors
     *
     * @method logError
     * @param {String or Object} error The name of the error (string), or an object formed as follows {name: 'exampleName', message: 'exampleMessage', stack: 'exampleStack'}
     * @param {Object} [attrs] Custom attrs to be passed along with the error event; values must be string, number, or boolean
     */ /**
     * Logs `click` events
     * @method logLink
     * @param {String} selector The selector to add a 'click' event to (ex. #purchase-event)
     * @param {String} [eventName] The name of the event
     * @param {Number} [eventType] The eventType as seen [here](http://docs.mparticle.com/developers/sdk/javascript/event-tracking#event-type)
     * @param {Object} [eventInfo] Attributes for the event
     */ /**
     * Logs `submit` events
     * @method logForm
     * @param {String} selector The selector to add the event handler to (ex. #search-event)
     * @param {String} [eventName] The name of the event
     * @param {Number} [eventType] The eventType as seen [here](http://docs.mparticle.com/developers/sdk/javascript/event-tracking#event-type)
     * @param {Object} [eventInfo] Attributes for the event
     */ /**
     * Logs a page view
     * @method logPageView
     * @param {String} eventName The name of the event. Defaults to 'PageView'.
     * @param {Object} [attrs] Attributes for the event
     * @param {Object} [customFlags] Custom flags for the event
     * @param {Object} [eventOptions] For Event-level Configuration Options
     */ /**
     * Forces an upload of the batch
     * @method upload
     */ /**
     * Invoke these methods on the mParticle.Consent object.
     * Example: mParticle.Consent.createConsentState()
     *
     * @class mParticle.Consent
     */ /**
     * Invoke these methods on the mParticle.eCommerce object.
     * Example: mParticle.eCommerce.createImpresion(...)
     * @class mParticle.eCommerce
     */ /**
     * Sets a session attribute
     * @method setSessionAttribute
     * @param {String} key key for session attribute
     * @param {String or Number} value value for session attribute
     */ /**
     * Set opt out of logging
     * @method setOptOut
     * @param {Boolean} isOptingOut boolean to opt out or not. When set to true, opt out of logging.
     */ /**
     * Set or remove the integration attributes for a given integration ID.
     * Integration attributes are keys and values specific to a given integration. For example,
     * many integrations have their own internal user/device ID. mParticle will store integration attributes
     * for a given device, and will be able to use these values for server-to-server communication to services.
     * This is often useful when used in combination with a server-to-server feed, allowing the feed to be enriched
     * with the necessary integration attributes to be properly forwarded to the given integration.
     * @method setIntegrationAttribute
     * @param {Number} integrationId mParticle integration ID
     * @param {Object} attrs a map of attributes that will replace any current attributes. The keys are predefined by mParticle.
     * Please consult with the mParticle docs or your solutions consultant for the correct value. You may
     * also pass a null or empty map here to remove all of the attributes.
     */ /**
     * Get integration attributes for a given integration ID.
     * @method getIntegrationAttributes
     * @param {Number} integrationId mParticle integration ID
     * @return {Object} an object map of the integrationId's attributes
     */ // Used by our forwarders
this._instanceName=a,this._NativeSdkHelpers=new NativeSdkHelpers(this),this._Migrations=new Migrations(this),this._SessionManager=new SessionManager(this),this._Persistence=new _Persistence(this),this._Helpers=new Helpers(this),this._Events=new Events(this),this._CookieSyncManager=new cookieSyncManager(this),this._ServerModel=new ServerModel(this),this._Ecommerce=new Ecommerce(this),this._ForwardingStatsUploader=new forwardingStatsUploader(this),this._Consent=new Consent(this),this._IdentityAPIClient=new IdentityAPIClient(this),this._preInit={readyQueue:[],integrationDelays:{},forwarderConstructors:[]},this.IdentityType=Types.IdentityType,this.EventType=Types.EventType,this.CommerceEventType=Types.CommerceEventType,this.PromotionType=Types.PromotionActionType,this.ProductActionType=Types.ProductActionType,this._Identity=new Identity(this),this.Identity=this._Identity.IdentityAPI,this.generateHash=this._Helpers.generateHash,this.getDeviceId=this._Persistence.getDeviceId,"undefined"!=typeof window&&window.mParticle&&window.mParticle.config&&window.mParticle.config.hasOwnProperty("rq")&&(this._preInit.readyQueue=window.mParticle.config.rq),this.init=function(a,b){// config code - Fetch config when requestConfig = true, otherwise, proceed with SDKInitialization
// Since fetching the configuration is asynchronous, we must pass completeSDKInitialization
// to it for it to be run after fetched
return b||console.warn("You did not pass a config object to init(). mParticle will not initialize properly"),runPreConfigFetchInitialization(this,a,b),b?void(!b.hasOwnProperty("requestConfig")||b.requestConfig?new ConfigAPIClient().getSDKConfiguration(a,b,completeSDKInitialization,this):completeSDKInitialization(a,b,this)):void console.error("No config available on the window, please pass a config object to mParticle.init()")},this.setLogLevel=function(a){b.Logger.setLogLevel(a);},this.reset=function(a){try{a._Persistence.resetPersistence(),a._Store&&delete a._Store;}catch(a){console.error("Cannot reset mParticle",a);}},this._resetForTests=function(a,b,c){c._Store&&delete c._Store,c._Store=new Store(a,c),c._Store.isLocalStorageAvailable=c._Persistence.determineLocalStorageAvailability(window.localStorage),c._Events.stopTracking(),b||c._Persistence.resetPersistence(),c._Persistence.forwardingStatsBatches.uploadsTable={},c._Persistence.forwardingStatsBatches.forwardingStatsEventQueue=[],c._preInit={readyQueue:[],pixelConfigurations:[],integrationDelays:{},forwarderConstructors:[],isDevelopmentMode:!1};},this.ready=function(a){b.isInitialized()&&"function"==typeof a?a():b._preInit.readyQueue.push(a);},this.getVersion=function(){return Constants.sdkVersion},this.setAppVersion=function(a){var c=queueIfNotInitialized(function(){b.setAppVersion(a);},b);c||(b._Store.SDKConfig.appVersion=a,b._Persistence.update());},this.setDeviceId=function(a){var c=queueIfNotInitialized(function(){b.setDeviceId(a);},b);c||this._Persistence.setDeviceId(a);},this.isInitialized=function(){return !!b._Store&&b._Store.isInitialized},this.getAppName=function(){return b._Store.SDKConfig.appName},this.setAppName=function(a){var c=queueIfNotInitialized(function(){b.setAppName(a);},b);c||(b._Store.SDKConfig.appName=a);},this.getAppVersion=function(){return b._Store.SDKConfig.appVersion},this.stopTrackingLocation=function(){b._SessionManager.resetSessionTimer(),b._Events.stopTracking();},this.startTrackingLocation=function(a){b._Helpers.Validators.isFunction(a)||b.Logger.warning("Warning: Location tracking is triggered, but not including a callback into the `startTrackingLocation` may result in events logged too quickly and not being associated with a location."),b._SessionManager.resetSessionTimer(),b._Events.startTracking(a);},this.setPosition=function(a,c){var d=queueIfNotInitialized(function(){b.setPosition(a,c);},b);d||(b._SessionManager.resetSessionTimer(),"number"==typeof a&&"number"==typeof c?b._Store.currentPosition={lat:a,lng:c}:b.Logger.error("Position latitude and/or longitude must both be of type number"));},this.startNewSession=function(){b._SessionManager.startNewSession();},this.endSession=function(){// Sends true as an over ride vs when endSession is called from the setInterval
b._SessionManager.endSession(!0);},this.logBaseEvent=function(a,c){var d=queueIfNotInitialized(function(){b.logBaseEvent(a,c);},b);if(!d)return (b._SessionManager.resetSessionTimer(),"string"!=typeof a.name)?void b.Logger.error(Messages.ErrorMessages.EventNameInvalidType):(a.eventType||(a.eventType=Types.EventType.Unknown),b._Helpers.canLog()?void b._Events.logEvent(a,c):void b.Logger.error(Messages.ErrorMessages.LoggingDisabled))},this.logEvent=function(a,c,d,e,f){var g=queueIfNotInitialized(function(){b.logEvent(a,c,d,e,f);},b);if(!g)return (b._SessionManager.resetSessionTimer(),"string"!=typeof a)?void b.Logger.error(Messages.ErrorMessages.EventNameInvalidType):(c||(c=Types.EventType.Unknown),b._Helpers.isEventType(c)?b._Helpers.canLog()?void b._Events.logEvent({messageType:Types.MessageType.PageEvent,name:a,data:d,eventType:c,customFlags:e},f):void b.Logger.error(Messages.ErrorMessages.LoggingDisabled):void b.Logger.error("Invalid event type: "+c+", must be one of: \n"+JSON.stringify(Types.EventType)))},this.logError=function(a,c){var d=queueIfNotInitialized(function(){b.logError(a,c);},b);if(!d&&(b._SessionManager.resetSessionTimer(),!!a)){"string"==typeof a&&(a={message:a});var e={m:a.message?a.message:a,s:"Error",t:a.stack||null};if(c){var f=b._Helpers.sanitizeAttributes(c,e.m);for(var g in f)e[g]=f[g];}b._Events.logEvent({messageType:Types.MessageType.CrashReport,name:a.name?a.name:"Error",data:e,eventType:Types.EventType.Other});}},this.logLink=function(a,c,d,e){b._Events.addEventHandler("click",a,c,e,d);},this.logForm=function(a,c,d,e){b._Events.addEventHandler("submit",a,c,e,d);},this.logPageView=function(a,c,d,e){var f=queueIfNotInitialized(function(){b.logPageView(a,c,d,e);},b);if(!f){if(b._SessionManager.resetSessionTimer(),b._Helpers.canLog()){if(b._Helpers.Validators.isStringOrNumber(a)||(a="PageView"),!c)c={hostname:window.location.hostname,title:window.document.title};else if(!b._Helpers.isObject(c))return void b.Logger.error("The attributes argument must be an object. A "+_typeof(c)+" was entered. Please correct and retry.");if(d&&!b._Helpers.isObject(d))return void b.Logger.error("The customFlags argument must be an object. A "+_typeof(d)+" was entered. Please correct and retry.")}b._Events.logEvent({messageType:Types.MessageType.PageView,name:a,data:c,eventType:Types.EventType.Unknown,customFlags:d},e);}},this.upload=function(){b._Helpers.canLog()&&(b._Store.webviewBridgeEnabled?b._NativeSdkHelpers.sendToNative(Constants.NativeSdkPaths.Upload):b._APIClient.uploader.prepareAndUpload(!1,!1));},this.Consent={/**
         * Creates a CCPA Opt Out Consent State.
         *
         * @method createCCPAConsent
         * @param {Boolean} optOut true represents a "data sale opt-out", false represents the user declining a "data sale opt-out"
         * @param {Number} timestamp Unix time (likely to be Date.now())
         * @param {String} consentDocument document version or experience that the user may have consented to
         * @param {String} location location where the user gave consent
         * @param {String} hardwareId hardware ID for the device or browser used to give consent. This property exists only to provide additional context and is not used to identify users
         * @return {Object} CCPA Consent State
         */createCCPAConsent:b._Consent.createPrivacyConsent,/**
         * Creates a GDPR Consent State.
         *
         * @method createGDPRConsent
         * @param {Boolean} consent true represents a "data sale opt-out", false represents the user declining a "data sale opt-out"
         * @param {Number} timestamp Unix time (likely to be Date.now())
         * @param {String} consentDocument document version or experience that the user may have consented to
         * @param {String} location location where the user gave consent
         * @param {String} hardwareId hardware ID for the device or browser used to give consent. This property exists only to provide additional context and is not used to identify users
         * @return {Object} GDPR Consent State
         */createGDPRConsent:b._Consent.createPrivacyConsent,/**
         * Creates a Consent State Object, which can then be used to set CCPA states, add multiple GDPR states, as well as get and remove these privacy states.
         *
         * @method createConsentState
         * @return {Object} ConsentState object
         */createConsentState:b._Consent.createConsentState},this.eCommerce={/**
         * Invoke these methods on the mParticle.eCommerce.Cart object.
         * Example: mParticle.eCommerce.Cart.add(...)
         * @class mParticle.eCommerce.Cart
         * @deprecated
         */Cart:{/**
             * Adds a product to the cart
             * @method add
             * @param {Object} product The product you want to add to the cart
             * @param {Boolean} [logEventBoolean] Option to log the event to mParticle's servers. If blank, no logging occurs.
             * @deprecated
             */add:function add(a,c){b.Logger.warning("Deprecated function eCommerce.Cart.add() will be removed in future releases");var d,e=b.Identity.getCurrentUser();e&&(d=e.getMPID()),b._Identity.mParticleUserCart(d).add(a,c);},/**
             * Removes a product from the cart
             * @method remove
             * @param {Object} product The product you want to add to the cart
             * @param {Boolean} [logEventBoolean] Option to log the event to mParticle's servers. If blank, no logging occurs.
             * @deprecated
             */remove:function remove(a,c){b.Logger.warning("Deprecated function eCommerce.Cart.remove() will be removed in future releases");var d,e=b.Identity.getCurrentUser();e&&(d=e.getMPID()),b._Identity.mParticleUserCart(d).remove(a,c);},/**
             * Clears the cart
             * @method clear
             * @deprecated
             */clear:function clear(){b.Logger.warning("Deprecated function eCommerce.Cart.clear() will be removed in future releases");var a,c=b.Identity.getCurrentUser();c&&(a=c.getMPID()),b._Identity.mParticleUserCart(a).clear();}},/**
         * Sets the currency code
         * @for mParticle.eCommerce
         * @method setCurrencyCode
         * @param {String} code The currency code
         */setCurrencyCode:function setCurrencyCode(a){var c=queueIfNotInitialized(function(){b.eCommerce.setCurrencyCode(a);},b);return c?void 0:"string"==typeof a?void(b._SessionManager.resetSessionTimer(),b._Store.currencyCode=a):void b.Logger.error("Code must be a string")},/**
         * Creates a product
         * @for mParticle.eCommerce
         * @method createProduct
         * @param {String} name product name
         * @param {String} sku product sku
         * @param {Number} price product price
         * @param {Number} [quantity] product quantity. If blank, defaults to 1.
         * @param {String} [variant] product variant
         * @param {String} [category] product category
         * @param {String} [brand] product brand
         * @param {Number} [position] product position
         * @param {String} [coupon] product coupon
         * @param {Object} [attributes] product attributes
         */createProduct:function createProduct(a,c,d,e,f,g,h,i,j,k){return b._Ecommerce.createProduct(a,c,d,e,f,g,h,i,j,k)},/**
         * Creates a promotion
         * @for mParticle.eCommerce
         * @method createPromotion
         * @param {String} id a unique promotion id
         * @param {String} [creative] promotion creative
         * @param {String} [name] promotion name
         * @param {Number} [position] promotion position
         */createPromotion:function createPromotion(a,c,d,e){return b._Ecommerce.createPromotion(a,c,d,e)},/**
         * Creates a product impression
         * @for mParticle.eCommerce
         * @method createImpression
         * @param {String} name impression name
         * @param {Object} product the product for which an impression is being created
         */createImpression:function createImpression(a,c){return b._Ecommerce.createImpression(a,c)},/**
         * Creates a transaction attributes object to be used with a checkout
         * @for mParticle.eCommerce
         * @method createTransactionAttributes
         * @param {String or Number} id a unique transaction id
         * @param {String} [affiliation] affilliation
         * @param {String} [couponCode] the coupon code for which you are creating transaction attributes
         * @param {Number} [revenue] total revenue for the product being purchased
         * @param {String} [shipping] the shipping method
         * @param {Number} [tax] the tax amount
         */createTransactionAttributes:function createTransactionAttributes(a,c,d,e,f,g){return b._Ecommerce.createTransactionAttributes(a,c,d,e,f,g)},/**
         * Logs a checkout action
         * @for mParticle.eCommerce
         * @method logCheckout
         * @param {Number} step checkout step number
         * @param {String} option
         * @param {Object} attrs
         * @param {Object} [customFlags] Custom flags for the event
         * @deprecated
         */logCheckout:function logCheckout(a,c,d,e){return b.Logger.warning("mParticle.logCheckout is deprecated, please use mParticle.logProductAction instead"),b._Store.isInitialized?void(b._SessionManager.resetSessionTimer(),b._Events.logCheckoutEvent(a,c,d,e)):void b.ready(function(){b.eCommerce.logCheckout(a,c,d,e);})},/**
         * Logs a product action
         * @for mParticle.eCommerce
         * @method logProductAction
         * @param {Number} productActionType product action type as found [here](https://github.com/mParticle/mparticle-sdk-javascript/blob/master-v2/src/types.js#L206-L218)
         * @param {Object} product the product for which you are creating the product action
         * @param {Object} [attrs] attributes related to the product action
         * @param {Object} [customFlags] Custom flags for the event
         * @param {Object} [transactionAttributes] Transaction Attributes for the event
         * @param {Object} [eventOptions] For Event-level Configuration Options
         */logProductAction:function logProductAction(a,c,d,e,f,g){var h=queueIfNotInitialized(function(){b.eCommerce.logProductAction(a,c,d,e,f,g);},b);h||(b._SessionManager.resetSessionTimer(),b._Events.logProductActionEvent(a,c,d,e,f,g));},/**
         * Logs a product purchase
         * @for mParticle.eCommerce
         * @method logPurchase
         * @param {Object} transactionAttributes transactionAttributes object
         * @param {Object} product the product being purchased
         * @param {Boolean} [clearCart] boolean to clear the cart after logging or not. Defaults to false
         * @param {Object} [attrs] other attributes related to the product purchase
         * @param {Object} [customFlags] Custom flags for the event
         * @deprecated
         */logPurchase:function logPurchase(a,c,d,e,f){return b.Logger.warning("mParticle.logPurchase is deprecated, please use mParticle.logProductAction instead"),b._Store.isInitialized?a&&c?void(b._SessionManager.resetSessionTimer(),b._Events.logPurchaseEvent(a,c,e,f)):void b.Logger.error(Messages.ErrorMessages.BadLogPurchase):void b.ready(function(){b.eCommerce.logPurchase(a,c,d,e,f);})},/**
         * Logs a product promotion
         * @for mParticle.eCommerce
         * @method logPromotion
         * @param {Number} type the promotion type as found [here](https://github.com/mParticle/mparticle-sdk-javascript/blob/master-v2/src/types.js#L275-L279)
         * @param {Object} promotion promotion object
         * @param {Object} [attrs] boolean to clear the cart after logging or not
         * @param {Object} [customFlags] Custom flags for the event
         * @param {Object} [eventOptions] For Event-level Configuration Options
         */logPromotion:function logPromotion(a,c,d,e,f){var g=queueIfNotInitialized(function(){b.eCommerce.logPromotion(a,c,d,e,f);},b);g||(b._SessionManager.resetSessionTimer(),b._Events.logPromotionEvent(a,c,d,e,f));},/**
         * Logs a product impression
         * @for mParticle.eCommerce
         * @method logImpression
         * @param {Object} impression product impression object
         * @param {Object} attrs attributes related to the impression log
         * @param {Object} [customFlags] Custom flags for the event
         * @param {Object} [eventOptions] For Event-level Configuration Options
         */logImpression:function logImpression(a,c,d,e){var f=queueIfNotInitialized(function(){b.eCommerce.logImpression(a,c,d,e);},b);f||(b._SessionManager.resetSessionTimer(),b._Events.logImpressionEvent(a,c,d,e));},/**
         * Logs a refund
         * @for mParticle.eCommerce
         * @method logRefund
         * @param {Object} transactionAttributes transaction attributes related to the refund
         * @param {Object} product product being refunded
         * @param {Boolean} [clearCart] boolean to clear the cart after refund is logged. Defaults to false.
         * @param {Object} [attrs] attributes related to the refund
         * @param {Object} [customFlags] Custom flags for the event
         * @deprecated
         */logRefund:function logRefund(a,c,d,e,f){return b.Logger.warning("mParticle.logRefund is deprecated, please use mParticle.logProductAction instead"),b._Store.isInitialized?void(b._SessionManager.resetSessionTimer(),b._Events.logRefundEvent(a,c,e,f)):void b.ready(function(){b.eCommerce.logRefund(a,c,d,e,f);})},expandCommerceEvent:function expandCommerceEvent(a){return b._Ecommerce.expandCommerceEvent(a)}},this.setSessionAttribute=function(a,c){var d=queueIfNotInitialized(function(){b.setSessionAttribute(a,c);},b);if(!d&&b._Helpers.canLog())// Logs to cookie
// And logs to in-memory object
// Example: mParticle.setSessionAttribute('location', '33431');
{if(!b._Helpers.Validators.isValidAttributeValue(c))return void b.Logger.error(Messages.ErrorMessages.BadAttribute);if(!b._Helpers.Validators.isValidKeyValue(a))return void b.Logger.error(Messages.ErrorMessages.BadKey);if(b._Store.webviewBridgeEnabled)b._NativeSdkHelpers.sendToNative(Constants.NativeSdkPaths.SetSessionAttribute,JSON.stringify({key:a,value:c}));else {var e=b._Helpers.findKeyInObject(b._Store.sessionAttributes,a);e&&(a=e),b._Store.sessionAttributes[a]=c,b._Persistence.update(),b._Forwarders.applyToForwarders("setSessionAttribute",[a,c]);}}},this.setOptOut=function(a){var c=queueIfNotInitialized(function(){b.setOptOut(a);},b);c||(b._SessionManager.resetSessionTimer(),b._Store.isEnabled=!a,b._Events.logOptOut(),b._Persistence.update(),b._Store.activeForwarders.length&&b._Store.activeForwarders.forEach(function(c){if(c.setOptOut){var d=c.setOptOut(a);d&&b.Logger.verbose(d);}}));},this.setIntegrationAttribute=function(a,c){var d=queueIfNotInitialized(function(){b.setIntegrationAttribute(a,c);},b);if(!d){if("number"!=typeof a)return void b.Logger.error("integrationId must be a number");if(null===c)b._Store.integrationAttributes[a]={};else {if(!b._Helpers.isObject(c))return void b.Logger.error("Attrs must be an object with keys and values. You entered a "+_typeof(c));if(0===Object.keys(c).length)b._Store.integrationAttributes[a]={};else for(var e in c)if("string"!=typeof e){b.Logger.error("Keys must be strings, you entered a "+_typeof(e));continue}else if("string"==typeof c[e])b._Helpers.isObject(b._Store.integrationAttributes[a])?b._Store.integrationAttributes[a][e]=c[e]:(b._Store.integrationAttributes[a]={},b._Store.integrationAttributes[a][e]=c[e]);else {b.Logger.error("Values for integration attributes must be strings. You entered a "+_typeof(c[e]));continue}}b._Persistence.update();}},this.getIntegrationAttributes=function(a){return b._Store.integrationAttributes[a]?b._Store.integrationAttributes[a]:{}},this.addForwarder=function(a){b._preInit.forwarderConstructors.push(a);},this.configurePixel=function(a){b._Forwarders.configurePixel(a);},this._getActiveForwarders=function(){return b._Store.activeForwarders},this._getIntegrationDelays=function(){return b._preInit.integrationDelays},this._setIntegrationDelay=function(a,c){b._preInit.integrationDelays[a]=c;};}// Some (server) config settings need to be returned before they are set on SDKConfig in a self hosted environment
function completeSDKInitialization(a,b,c){var d=createKitBlocker(b,c);if(c._APIClient=new APIClient(c,d),c._Forwarders=new Forwarders(c,d),b.flags){if(b.flags.hasOwnProperty(Constants.FeatureFlags.EventsV3)){// TODO: Remove this after 8/12/2022
if("100"!==b.flags[Constants.FeatureFlags.EventsV3]){c.Logger.warning("mParticle will be enabling Event Batching for all customers on July 12, 2022. For more details, please see our docs: https://docs.mparticle.com/developers/sdk/web/getting-started/");}c._Store.SDKConfig.flags[Constants.FeatureFlags.EventsV3]=b.flags[Constants.FeatureFlags.EventsV3];}b.flags.hasOwnProperty(Constants.FeatureFlags.EventBatchingIntervalMillis)&&(c._Store.SDKConfig.flags[Constants.FeatureFlags.EventBatchingIntervalMillis]=b.flags[Constants.FeatureFlags.EventBatchingIntervalMillis]);}if(c._Store.storageName=c._Helpers.createMainStorageName(b.workspaceToken),c._Store.prodStorageName=c._Helpers.createProductStorageName(b.workspaceToken),b.hasOwnProperty("workspaceToken")?c._Store.SDKConfig.workspaceToken=b.workspaceToken:c.Logger.warning("You should have a workspaceToken on your config object for security purposes."),b.hasOwnProperty("requiredWebviewBridgeName")?c._Store.SDKConfig.requiredWebviewBridgeName=b.requiredWebviewBridgeName:b.hasOwnProperty("workspaceToken")&&(c._Store.SDKConfig.requiredWebviewBridgeName=b.workspaceToken),c._Store.webviewBridgeEnabled=c._NativeSdkHelpers.isWebviewEnabled(c._Store.SDKConfig.requiredWebviewBridgeName,c._Store.SDKConfig.minWebviewBridgeVersion),c._Store.configurationLoaded=!0,c._Store.webviewBridgeEnabled||(c._Migrations.migrate(),c._Persistence.initializeStorage()),c._Store.webviewBridgeEnabled)c._NativeSdkHelpers.sendToNative(Constants.NativeSdkPaths.SetSessionAttribute,JSON.stringify({key:"$src_env",value:"webview"})),a&&c._NativeSdkHelpers.sendToNative(Constants.NativeSdkPaths.SetSessionAttribute,JSON.stringify({key:"$src_key",value:a}));else {var e;// If no initialIdentityRequest is passed in, we set the user identities to what is currently in cookies for the identify request
if(c._Helpers.isObject(c._Store.SDKConfig.identifyRequest)&&c._Helpers.isObject(c._Store.SDKConfig.identifyRequest.userIdentities)&&0===Object.keys(c._Store.SDKConfig.identifyRequest.userIdentities).length||!c._Store.SDKConfig.identifyRequest){var f={};if(e=c.Identity.getCurrentUser(),e){var g=e.getUserIdentities().userIdentities||{};for(var h in g)g.hasOwnProperty(h)&&(f[h]=g[h]);}c._Store.SDKConfig.identifyRequest={userIdentities:f};}// If migrating from pre-IDSync to IDSync, a sessionID will exist and an identify request will not have been fired, so we need this check
c._Store.migratingToIDSyncCookies&&(c.Identity.identify(c._Store.SDKConfig.identifyRequest,c._Store.SDKConfig.identityCallback),c._Store.migratingToIDSyncCookies=!1),e=c.Identity.getCurrentUser(),c._Helpers.getFeatureFlag(Constants.FeatureFlags.ReportBatching)&&c._ForwardingStatsUploader.startForwardingStatsTimer(),c._Forwarders.processForwarders(b,c._APIClient.prepareForwardingStats),c._SessionManager.initialize(),c._Events.logAST(),!c._Store.identifyCalled&&c._Store.SDKConfig.identityCallback&&e&&e.getMPID()&&c._Store.SDKConfig.identityCallback({httpCode:HTTPCodes.activeSession,getUser:function getUser(){return c._Identity.mParticleUser(e.getMPID())},getPreviousUser:function getPreviousUser(){var a=c.Identity.getUsers(),b=a.shift();return b&&e&&b.getMPID()===e.getMPID()&&(b=a.shift()),b||null},body:{mpid:e.getMPID(),is_logged_in:c._Store.isLoggedIn,matched_identities:e.getUserIdentities().userIdentities,context:null,is_ephemeral:!1}});}c._Store.isInitialized=!0,c._preInit.readyQueue&&c._preInit.readyQueue.length&&(c._preInit.readyQueue.forEach(function(a){c._Helpers.Validators.isFunction(a)?a():Array.isArray(a)&&processPreloadedItem(a,c);}),c._preInit.readyQueue=[]),c._Store.isFirstRun&&(c._Store.isFirstRun=!1);}function createKitBlocker(a,b){var c,d,e,f;/*  There are three ways a data plan object for blocking can be passed to the SDK:
            1. Manually via config.dataPlanOptions (this takes priority)
            If not passed in manually, we user the server provided via either
            2. Snippet via /mparticle.js endpoint (config.dataPlan.document)
            3. Self hosting via /config endpoint (config.dataPlanResult)
    */return a.dataPlanOptions&&(b.Logger.verbose("Customer provided data plan found"),f=a.dataPlanOptions,d={document:{dtpn:{vers:f.dataPlanVersion,blok:{ev:f.blockEvents,ea:f.blockEventAttributes,ua:f.blockUserAttributes,id:f.blockUserIdentities}}}}),d||(a.dataPlan&&a.dataPlan.document?a.dataPlan.document.error_message?e=a.dataPlan.document.error_message:(b.Logger.verbose("Data plan found from mParticle.js"),d=a.dataPlan):a.dataPlanResult&&(a.dataPlanResult.error_message?e=a.dataPlanResult.error_message:(b.Logger.verbose("Data plan found from /config"),d={document:a.dataPlanResult}))),e&&b.Logger.error(e),d&&(c=new KitBlocker(d,b)),c}function runPreConfigFetchInitialization(a,b,c){a.Logger=new Logger(c),a._Store=new Store(c,a),window.mParticle.Store=a._Store,a._Store.devToken=b||null,a.Logger.verbose(Messages.InformationMessages.StartingInitialization);//check to see if localStorage is available for migrating purposes
try{a._Store.isLocalStorageAvailable=a._Persistence.determineLocalStorageAvailability(window.localStorage);}catch(b){a.Logger.warning("localStorage is not available, using cookies if available"),a._Store.isLocalStorageAvailable=!1;}}function processPreloadedItem(a,b){var c=a,d=c.splice(0,1)[0];// if the first argument is a method on the base mParticle object, run it
if(mParticle[c[0]])mParticle[d].apply(this,c);else {var e=d.split(".");try{for(var f,g=mParticle,h=0;h<e.length;h++)f=e[h],g=g[f];g.apply(this,c);}catch(a){b.Logger.verbose("Unable to compute proper mParticle function "+a);}}}function queueIfNotInitialized(a,b){return !b.isInitialized()&&(b.ready(function(){a();}),!0)}

// This file is used ONLY for the mParticle ESLint plugin. It should NOT be used otherwise!
var _BatchValidator=/** @class */function(){function a(){}return a.prototype.getMPInstance=function(){return {// Certain Helper, Store, and Identity properties need to be mocked to be used in the `returnBatch` method
_Helpers:{sanitizeAttributes:window.mParticle.getInstance()._Helpers.sanitizeAttributes,generateUniqueId:function generateUniqueId(){return "mockId"},extend:window.mParticle.getInstance()._Helpers.extend},_Store:{sessionId:"mockSessionId",SDKConfig:{}},Identity:{getCurrentUser:function getCurrentUser(){return null}},getAppVersion:function getAppVersion(){return null},getAppName:function getAppName(){return null}}},a.prototype.returnBatch=function(a){var b=this.getMPInstance(),c=new ServerModel(b).createEventObject(a),d=convertEvents("0",[c],b);return d},a}();

Array.prototype.forEach||(Array.prototype.forEach=Polyfill.forEach),Array.prototype.map||(Array.prototype.map=Polyfill.map),Array.prototype.filter||(Array.prototype.filter=Polyfill.filter),Array.isArray||(Array.prototype.isArray=Polyfill.isArray);function mParticle$1(){var a=this;// Only leaving this here in case any clients are trying to access mParticle.Store, to prevent from throwing
/**
     * Initializes the mParticle instance. If no instanceName is provided, an instance name of `default_instance` will be used.
     * <p>
     * If you'd like to initiate multiple mParticle instances, first review our <a href="https://docs.mparticle.com/developers/sdk/web/multiple-instances/">doc site</a>, and ensure you pass a unique instance name as the third argument as shown below.
     * @method init
     * @param {String} apiKey your mParticle assigned API key
     * @param {Object} [config] an options object for additional configuration
     * @param {String} [instanceName] If you are self hosting the JS SDK and working with multiple instances, you would pass an instanceName to `init`. This instance will be selected when invoking other methods. See the above link to the doc site for more info and examples.
     */this.Store={},this._instances={},this.IdentityType=Types.IdentityType,this.EventType=Types.EventType,this.CommerceEventType=Types.CommerceEventType,this.PromotionType=Types.PromotionActionType,this.ProductActionType=Types.ProductActionType,"undefined"!=typeof window&&(this.isIOS=!!(window.mParticle&&window.mParticle.isIOS)&&window.mParticle.isIOS,this.config=window.mParticle&&window.mParticle.config?window.mParticle.config:{}),this.init=function(b,c,d){!c&&window.mParticle&&window.mParticle.config&&(console.warn("You did not pass a config object to mParticle.init(). Attempting to use the window.mParticle.config if it exists. Please note that in a future release, this may not work and mParticle will not initialize properly"),c=window.mParticle?window.mParticle.config:{}),d=(d&&0!==d.length?d:Constants.DefaultInstance).toLowerCase();var e=a._instances[d];e===void 0&&(e=new mParticleInstance(b),a._instances[d]=e),e.init(b,c,d);},this.getInstance=function(b){var c;return b?(c=a._instances[b.toLowerCase()],c?c:(console.log("You tried to initialize an instance named "+b+". This instance does not exist. Check your instance name or initialize a new instance with this name before calling it."),null)):(b=Constants.DefaultInstance,c=a._instances[b],c||(c=new mParticleInstance(b),a._instances[Constants.DefaultInstance]=c),c)},this.getDeviceId=function(){return a.getInstance().getDeviceId()},this.setDeviceId=function(b){return a.getInstance().setDeviceId(b)},this.isInitialized=function(){return a.getInstance().isInitialized()},this.startNewSession=function(){a.getInstance().startNewSession();},this.endSession=function(){a.getInstance().endSession();},this.setLogLevel=function(b){a.getInstance().setLogLevel(b);},this.ready=function(b){a.getInstance().ready(b);},this.setAppVersion=function(b){a.getInstance().setAppVersion(b);},this.getAppName=function(){return a.getInstance().getAppName()},this.setAppName=function(b){a.getInstance().setAppName(b);},this.getAppVersion=function(){return a.getInstance().getAppVersion()},this.stopTrackingLocation=function(){a.getInstance().stopTrackingLocation();},this.startTrackingLocation=function(b){a.getInstance().startTrackingLocation(b);},this.setPosition=function(b,c){a.getInstance().setPosition(b,c);},this.startNewSession=function(){a.getInstance().startNewSession();},this.endSession=function(){a.getInstance().endSession();},this.logBaseEvent=function(b,c){a.getInstance().logBaseEvent(b,c);},this.logEvent=function(b,c,d,e,f){a.getInstance().logEvent(b,c,d,e,f);},this.logError=function(b,c){a.getInstance().logError(b,c);},this.logLink=function(b,c,d,e){a.getInstance().logLink(b,c,d,e);},this.logForm=function(b,c,d,e){a.getInstance().logForm(b,c,d,e);},this.logPageView=function(b,c,d,e){a.getInstance().logPageView(b,c,d,e);},this.upload=function(){a.getInstance().upload();},this.eCommerce={Cart:{add:function add(b,c){a.getInstance().eCommerce.Cart.add(b,c);},remove:function remove(b,c){a.getInstance().eCommerce.Cart.remove(b,c);},clear:function clear(){a.getInstance().eCommerce.Cart.clear();}},setCurrencyCode:function setCurrencyCode(b){a.getInstance().eCommerce.setCurrencyCode(b);},createProduct:function createProduct(b,c,d,e,f,g,h,i,j,k){return a.getInstance().eCommerce.createProduct(b,c,d,e,f,g,h,i,j,k)},createPromotion:function createPromotion(b,c,d,e){return a.getInstance().eCommerce.createPromotion(b,c,d,e)},createImpression:function createImpression(b,c){return a.getInstance().eCommerce.createImpression(b,c)},createTransactionAttributes:function createTransactionAttributes(b,c,d,e,f,g){return a.getInstance().eCommerce.createTransactionAttributes(b,c,d,e,f,g)},logCheckout:function logCheckout(b,c,d,e){a.getInstance().eCommerce.logCheckout(b,c,d,e);},logProductAction:function logProductAction(b,c,d,e,f,g){a.getInstance().eCommerce.logProductAction(b,c,d,e,f,g);},logPurchase:function logPurchase(b,c,d,e,f){a.getInstance().eCommerce.logPurchase(b,c,d,e,f);},logPromotion:function logPromotion(b,c,d,e,f){a.getInstance().eCommerce.logPromotion(b,c,d,e,f);},logImpression:function logImpression(b,c,d,e){a.getInstance().eCommerce.logImpression(b,c,d,e);},logRefund:function logRefund(b,c,d,e,f){a.getInstance().eCommerce.logRefund(b,c,d,e,f);},expandCommerceEvent:function expandCommerceEvent(b){return a.getInstance().eCommerce.expandCommerceEvent(b)}},this.setSessionAttribute=function(b,c){a.getInstance().setSessionAttribute(b,c);},this.setOptOut=function(b){a.getInstance().setOptOut(b);},this.setIntegrationAttribute=function(b,c){a.getInstance().setIntegrationAttribute(b,c);},this.getIntegrationAttributes=function(b){return a.getInstance().getIntegrationAttributes(b)},this.Identity={HTTPCodes:a.getInstance().Identity.HTTPCodes,aliasUsers:function aliasUsers(b,c){a.getInstance().Identity.aliasUsers(b,c);},createAliasRequest:function createAliasRequest(b,c){return a.getInstance().Identity.createAliasRequest(b,c)},getCurrentUser:function getCurrentUser(){return a.getInstance().Identity.getCurrentUser()},getUser:function getUser(b){return a.getInstance().Identity.getUser(b)},getUsers:function getUsers(){return a.getInstance().Identity.getUsers()},identify:function identify(b,c){a.getInstance().Identity.identify(b,c);},login:function login(b,c){a.getInstance().Identity.login(b,c);},logout:function logout(b,c){a.getInstance().Identity.logout(b,c);},modify:function modify(b,c){a.getInstance().Identity.modify(b,c);}},this.sessionManager={getSession:function getSession(){return a.getInstance()._SessionManager.getSession()}},this.Consent={createConsentState:function createConsentState(){return a.getInstance().Consent.createConsentState()},createGDPRConsent:function createGDPRConsent(b,c,d,e,f){return a.getInstance().Consent.createGDPRConsent(b,c,d,e,f)},createCCPAConsent:function createCCPAConsent(b,c,d,e,f){return a.getInstance().Consent.createGDPRConsent(b,c,d,e,f)}},this.reset=function(){a.getInstance().reset(a.getInstance());},this._resetForTests=function(b,c){"boolean"==typeof c?a.getInstance()._resetForTests(b,c,a.getInstance()):a.getInstance()._resetForTests(b,!1,a.getInstance());},this.configurePixel=function(b){a.getInstance().configurePixel(b);},this._setIntegrationDelay=function(b,c){a.getInstance()._setIntegrationDelay(b,c);},this._getIntegrationDelays=function(){return a.getInstance()._getIntegrationDelays()},this.getVersion=function(){return a.getInstance().getVersion()},this.generateHash=function(b){return a.getInstance().generateHash(b)},this.addForwarder=function(b){a.getInstance().addForwarder(b);},this._getActiveForwarders=function(){return a.getInstance()._getActiveForwarders()};}var mparticleInstance=new mParticle$1;"undefined"!=typeof window&&(window.mParticle=mparticleInstance,window.mParticle._BatchValidator=new _BatchValidator);

module.exports = mparticleInstance;

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],5:[function(require,module,exports){
(function (Buffer){(function (){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

}).call(this)}).call(this,require("buffer").Buffer)
},{"base64-js":4,"buffer":5,"ieee754":6}],6:[function(require,module,exports){
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],7:[function(require,module,exports){
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var t = _interopDefault(require('should-type'));

function format(msg) {
  var args = arguments;
  for (var i = 1, l = args.length; i < l; i++) {
    msg = msg.replace(/%s/, args[i]);
  }
  return msg;
}

var hasOwnProperty = Object.prototype.hasOwnProperty;

function EqualityFail(a, b, reason, path) {
  this.a = a;
  this.b = b;
  this.reason = reason;
  this.path = path;
}

function typeToString(tp) {
  return tp.type + (tp.cls ? "(" + tp.cls + (tp.sub ? " " + tp.sub : "") + ")" : "");
}

var PLUS_0_AND_MINUS_0 = "+0 is not equal to -0";
var DIFFERENT_TYPES = "A has type %s and B has type %s";
var EQUALITY = "A is not equal to B";
var EQUALITY_PROTOTYPE = "A and B have different prototypes";
var WRAPPED_VALUE = "A wrapped value is not equal to B wrapped value";
var FUNCTION_SOURCES = "function A is not equal to B by source code value (via .toString call)";
var MISSING_KEY = "%s has no key %s";
var SET_MAP_MISSING_KEY = "Set/Map missing key %s";

var DEFAULT_OPTIONS = {
  checkProtoEql: true,
  checkSubType: true,
  plusZeroAndMinusZeroEqual: true,
  collectAllFails: false
};

function setBooleanDefault(property, obj, opts, defaults) {
  obj[property] = typeof opts[property] !== "boolean" ? defaults[property] : opts[property];
}

var METHOD_PREFIX = "_check_";

function EQ(opts, a, b, path) {
  opts = opts || {};

  setBooleanDefault("checkProtoEql", this, opts, DEFAULT_OPTIONS);
  setBooleanDefault("plusZeroAndMinusZeroEqual", this, opts, DEFAULT_OPTIONS);
  setBooleanDefault("checkSubType", this, opts, DEFAULT_OPTIONS);
  setBooleanDefault("collectAllFails", this, opts, DEFAULT_OPTIONS);

  this.a = a;
  this.b = b;

  this._meet = opts._meet || [];

  this.fails = opts.fails || [];

  this.path = path || [];
}

function ShortcutError(fail) {
  this.name = "ShortcutError";
  this.message = "fail fast";
  this.fail = fail;
}

ShortcutError.prototype = Object.create(Error.prototype);

EQ.checkStrictEquality = function(a, b) {
  this.collectFail(a !== b, EQUALITY);
};

EQ.add = function add(type, cls, sub, f) {
  var args = Array.prototype.slice.call(arguments);
  f = args.pop();
  EQ.prototype[METHOD_PREFIX + args.join("_")] = f;
};

EQ.prototype = {
  check: function() {
    try {
      this.check0();
    } catch (e) {
      if (e instanceof ShortcutError) {
        return [e.fail];
      }
      throw e;
    }
    return this.fails;
  },

  check0: function() {
    var a = this.a;
    var b = this.b;

    // equal a and b exit early
    if (a === b) {
      // check for +0 !== -0;
      return this.collectFail(a === 0 && 1 / a !== 1 / b && !this.plusZeroAndMinusZeroEqual, PLUS_0_AND_MINUS_0);
    }

    var typeA = t(a);
    var typeB = t(b);

    // if objects has different types they are not equal
    if (typeA.type !== typeB.type || typeA.cls !== typeB.cls || typeA.sub !== typeB.sub) {
      return this.collectFail(true, format(DIFFERENT_TYPES, typeToString(typeA), typeToString(typeB)));
    }

    // as types the same checks type specific things
    var name1 = typeA.type,
      name2 = typeA.type;
    if (typeA.cls) {
      name1 += "_" + typeA.cls;
      name2 += "_" + typeA.cls;
    }
    if (typeA.sub) {
      name2 += "_" + typeA.sub;
    }

    var f =
      this[METHOD_PREFIX + name2] ||
      this[METHOD_PREFIX + name1] ||
      this[METHOD_PREFIX + typeA.type] ||
      this.defaultCheck;

    f.call(this, this.a, this.b);
  },

  collectFail: function(comparison, reason, showReason) {
    if (comparison) {
      var res = new EqualityFail(this.a, this.b, reason, this.path);
      res.showReason = !!showReason;

      this.fails.push(res);

      if (!this.collectAllFails) {
        throw new ShortcutError(res);
      }
    }
  },

  checkPlainObjectsEquality: function(a, b) {
    // compare deep objects and arrays
    // stacks contain references only
    //
    var meet = this._meet;
    var m = this._meet.length;
    while (m--) {
      var st = meet[m];
      if (st[0] === a && st[1] === b) {
        return;
      }
    }

    // add `a` and `b` to the stack of traversed objects
    meet.push([a, b]);

    // TODO maybe something else like getOwnPropertyNames
    var key;
    for (key in b) {
      if (hasOwnProperty.call(b, key)) {
        if (hasOwnProperty.call(a, key)) {
          this.checkPropertyEquality(key);
        } else {
          this.collectFail(true, format(MISSING_KEY, "A", key));
        }
      }
    }

    // ensure both objects have the same number of properties
    for (key in a) {
      if (hasOwnProperty.call(a, key)) {
        this.collectFail(!hasOwnProperty.call(b, key), format(MISSING_KEY, "B", key));
      }
    }

    meet.pop();

    if (this.checkProtoEql) {
      //TODO should i check prototypes for === or use eq?
      this.collectFail(Object.getPrototypeOf(a) !== Object.getPrototypeOf(b), EQUALITY_PROTOTYPE, true);
    }
  },

  checkPropertyEquality: function(propertyName) {
    var _eq = new EQ(this, this.a[propertyName], this.b[propertyName], this.path.concat([propertyName]));
    _eq.check0();
  },

  defaultCheck: EQ.checkStrictEquality
};

EQ.add(t.NUMBER, function(a, b) {
  this.collectFail((a !== a && b === b) || (b !== b && a === a) || (a !== b && a === a && b === b), EQUALITY);
});

[t.SYMBOL, t.BOOLEAN, t.STRING].forEach(function(tp) {
  EQ.add(tp, EQ.checkStrictEquality);
});

EQ.add(t.FUNCTION, function(a, b) {
  // functions are compared by their source code
  this.collectFail(a.toString() !== b.toString(), FUNCTION_SOURCES);
  // check user properties
  this.checkPlainObjectsEquality(a, b);
});

EQ.add(t.OBJECT, t.REGEXP, function(a, b) {
  // check regexp flags
  var flags = ["source", "global", "multiline", "lastIndex", "ignoreCase", "sticky", "unicode"];
  while (flags.length) {
    this.checkPropertyEquality(flags.shift());
  }
  // check user properties
  this.checkPlainObjectsEquality(a, b);
});

EQ.add(t.OBJECT, t.DATE, function(a, b) {
  //check by timestamp only (using .valueOf)
  this.collectFail(+a !== +b, EQUALITY);
  // check user properties
  this.checkPlainObjectsEquality(a, b);
});

[t.NUMBER, t.BOOLEAN, t.STRING].forEach(function(tp) {
  EQ.add(t.OBJECT, tp, function(a, b) {
    //primitive type wrappers
    this.collectFail(a.valueOf() !== b.valueOf(), WRAPPED_VALUE);
    // check user properties
    this.checkPlainObjectsEquality(a, b);
  });
});

EQ.add(t.OBJECT, function(a, b) {
  this.checkPlainObjectsEquality(a, b);
});

[t.ARRAY, t.ARGUMENTS, t.TYPED_ARRAY].forEach(function(tp) {
  EQ.add(t.OBJECT, tp, function(a, b) {
    this.checkPropertyEquality("length");

    this.checkPlainObjectsEquality(a, b);
  });
});

EQ.add(t.OBJECT, t.ARRAY_BUFFER, function(a, b) {
  this.checkPropertyEquality("byteLength");

  this.checkPlainObjectsEquality(a, b);
});

EQ.add(t.OBJECT, t.ERROR, function(a, b) {
  this.checkPropertyEquality("name");
  this.checkPropertyEquality("message");

  this.checkPlainObjectsEquality(a, b);
});

EQ.add(t.OBJECT, t.BUFFER, function(a) {
  this.checkPropertyEquality("length");

  var l = a.length;
  while (l--) {
    this.checkPropertyEquality(l);
  }

  //we do not check for user properties because
  //node Buffer have some strange hidden properties
});

function checkMapByKeys(a, b) {
  var iteratorA = a.keys();

  for (var nextA = iteratorA.next(); !nextA.done; nextA = iteratorA.next()) {
    var key = nextA.value;
    var hasKey = b.has(key);
    this.collectFail(!hasKey, format(SET_MAP_MISSING_KEY, key));

    if (hasKey) {
      var valueB = b.get(key);
      var valueA = a.get(key);

      eq(valueA, valueB, this);
    }
  }
}

function checkSetByKeys(a, b) {
  var iteratorA = a.keys();

  for (var nextA = iteratorA.next(); !nextA.done; nextA = iteratorA.next()) {
    var key = nextA.value;
    var hasKey = b.has(key);
    this.collectFail(!hasKey, format(SET_MAP_MISSING_KEY, key));
  }
}

EQ.add(t.OBJECT, t.MAP, function(a, b) {
  this._meet.push([a, b]);

  checkMapByKeys.call(this, a, b);
  checkMapByKeys.call(this, b, a);

  this._meet.pop();

  this.checkPlainObjectsEquality(a, b);
});
EQ.add(t.OBJECT, t.SET, function(a, b) {
  this._meet.push([a, b]);

  checkSetByKeys.call(this, a, b);
  checkSetByKeys.call(this, b, a);

  this._meet.pop();

  this.checkPlainObjectsEquality(a, b);
});

function eq(a, b, opts) {
  return new EQ(opts, a, b).check();
}

eq.EQ = EQ;

module.exports = eq;
},{"should-type":10}],8:[function(require,module,exports){
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var t = _interopDefault(require('should-type'));
var shouldTypeAdaptors = require('should-type-adaptors');

function looksLikeANumber(n) {
  return !!n.match(/\d+/);
}

function keyCompare(a, b) {
  var aNum = looksLikeANumber(a);
  var bNum = looksLikeANumber(b);
  if (aNum && bNum) {
    return 1*a - 1*b;
  } else if (aNum && !bNum) {
    return -1;
  } else if (!aNum && bNum) {
    return 1;
  } else {
    return a.localeCompare(b);
  }
}

function genKeysFunc(f) {
  return function(value) {
    var k = f(value);
    k.sort(keyCompare);
    return k;
  };
}

function Formatter(opts) {
  opts = opts || {};

  this.seen = [];

  var keysFunc;
  if (typeof opts.keysFunc === 'function') {
    keysFunc = opts.keysFunc;
  } else if (opts.keys === false) {
    keysFunc = Object.getOwnPropertyNames;
  } else {
    keysFunc = Object.keys;
  }

  this.getKeys = genKeysFunc(keysFunc);

  this.maxLineLength = typeof opts.maxLineLength === 'number' ? opts.maxLineLength : 60;
  this.propSep = opts.propSep || ',';

  this.isUTCdate = !!opts.isUTCdate;
}



Formatter.prototype = {
  constructor: Formatter,

  format: function(value) {
    var tp = t(value);

    if (this.alreadySeen(value)) {
      return '[Circular]';
    }

    var tries = tp.toTryTypes();
    var f = this.defaultFormat;
    while (tries.length) {
      var toTry = tries.shift();
      var name = Formatter.formatterFunctionName(toTry);
      if (this[name]) {
        f = this[name];
        break;
      }
    }
    return f.call(this, value).trim();
  },

  defaultFormat: function(obj) {
    return String(obj);
  },

  alreadySeen: function(value) {
    return this.seen.indexOf(value) >= 0;
  }

};

Formatter.addType = function addType(tp, f) {
  Formatter.prototype[Formatter.formatterFunctionName(tp)] = f;
};

Formatter.formatterFunctionName = function formatterFunctionName(tp) {
  return '_format_' + tp.toString('_');
};

var EOL = '\n';

function indent(v, indentation) {
  return v
    .split(EOL)
    .map(function(vv) {
      return indentation + vv;
    })
    .join(EOL);
}

function pad(str, value, filler) {
  str = String(str);
  var isRight = false;

  if (value < 0) {
    isRight = true;
    value = -value;
  }

  if (str.length < value) {
    var padding = new Array(value - str.length + 1).join(filler);
    return isRight ? str + padding : padding + str;
  } else {
    return str;
  }
}

function pad0(str, value) {
  return pad(str, value, '0');
}

var functionNameRE = /^\s*function\s*(\S*)\s*\(/;

function functionName(f) {
  if (f.name) {
    return f.name;
  }
  var matches = f.toString().match(functionNameRE);
  if (matches === null) {
    // `functionNameRE` doesn't match arrow functions.
    return '';
  }
  var name = matches[1];
  return name;
}

function constructorName(obj) {
  while (obj) {
    var descriptor = Object.getOwnPropertyDescriptor(obj, 'constructor');
    if (descriptor !== undefined &&  typeof descriptor.value === 'function') {
      var name = functionName(descriptor.value);
      if (name !== '') {
        return name;
      }
    }

    obj = Object.getPrototypeOf(obj);
  }
}

var INDENT = '  ';

function addSpaces(str) {
  return indent(str, INDENT);
}

function typeAdaptorForEachFormat(obj, opts) {
  opts = opts || {};
  var filterKey = opts.filterKey || function() { return true; };

  var formatKey = opts.formatKey || this.format;
  var formatValue = opts.formatValue || this.format;

  var keyValueSep = typeof opts.keyValueSep !== 'undefined' ? opts.keyValueSep : ': ';

  this.seen.push(obj);

  var formatLength = 0;
  var pairs = [];

  shouldTypeAdaptors.forEach(obj, function(value, key) {
    if (!filterKey(key)) {
      return;
    }

    var formattedKey = formatKey.call(this, key);
    var formattedValue = formatValue.call(this, value, key);

    var pair = formattedKey ? (formattedKey + keyValueSep + formattedValue) : formattedValue;

    formatLength += pair.length;
    pairs.push(pair);
  }, this);

  this.seen.pop();

  (opts.additionalKeys || []).forEach(function(keyValue) {
    var pair = keyValue[0] + keyValueSep + this.format(keyValue[1]);
    formatLength += pair.length;
    pairs.push(pair);
  }, this);

  var prefix = opts.prefix || constructorName(obj) || '';
  if (prefix.length > 0) {
    prefix += ' ';
  }

  var lbracket, rbracket;
  if (Array.isArray(opts.brackets)) {
    lbracket = opts.brackets[0];
    rbracket = opts.brackets[1];
  } else {
    lbracket = '{';
    rbracket = '}';
  }

  var rootValue = opts.value || '';

  if (pairs.length === 0) {
    return rootValue || (prefix + lbracket + rbracket);
  }

  if (formatLength <= this.maxLineLength) {
    return prefix + lbracket + ' ' + (rootValue ? rootValue + ' ' : '') + pairs.join(this.propSep + ' ') + ' ' + rbracket;
  } else {
    return prefix + lbracket + '\n' + (rootValue ? '  ' + rootValue + '\n' : '') + pairs.map(addSpaces).join(this.propSep + '\n') + '\n' + rbracket;
  }
}

function formatPlainObjectKey(key) {
  return typeof key === 'string' && key.match(/^[a-zA-Z_$][a-zA-Z_$0-9]*$/) ? key : this.format(key);
}

function getPropertyDescriptor(obj, key) {
  var desc;
  try {
    desc = Object.getOwnPropertyDescriptor(obj, key) || { value: obj[key] };
  } catch (e) {
    desc = { value: e };
  }
  return desc;
}

function formatPlainObjectValue(obj, key) {
  var desc = getPropertyDescriptor(obj, key);
  if (desc.get && desc.set) {
    return '[Getter/Setter]';
  }
  if (desc.get) {
    return '[Getter]';
  }
  if (desc.set) {
    return '[Setter]';
  }

  return this.format(desc.value);
}

function formatPlainObject(obj, opts) {
  opts = opts || {};
  opts.keyValueSep = ': ';
  opts.formatKey = opts.formatKey || formatPlainObjectKey;
  opts.formatValue = opts.formatValue || function(value, key) {
    return formatPlainObjectValue.call(this, obj, key);
  };
  return typeAdaptorForEachFormat.call(this, obj, opts);
}

function formatWrapper1(value) {
  return formatPlainObject.call(this, value, {
    additionalKeys: [['[[PrimitiveValue]]', value.valueOf()]]
  });
}


function formatWrapper2(value) {
  var realValue = value.valueOf();

  return formatPlainObject.call(this, value, {
    filterKey: function(key) {
      //skip useless indexed properties
      return !(key.match(/\d+/) && parseInt(key, 10) < realValue.length);
    },
    additionalKeys: [['[[PrimitiveValue]]', realValue]]
  });
}

function formatRegExp(value) {
  return formatPlainObject.call(this, value, {
    value: String(value)
  });
}

function formatFunction(value) {
  return formatPlainObject.call(this, value, {
    prefix: 'Function',
    additionalKeys: [['name', functionName(value)]]
  });
}

function formatArray(value) {
  return formatPlainObject.call(this, value, {
    formatKey: function(key) {
      if (!key.match(/\d+/)) {
        return formatPlainObjectKey.call(this, key);
      }
    },
    brackets: ['[', ']']
  });
}

function formatArguments(value) {
  return formatPlainObject.call(this, value, {
    formatKey: function(key) {
      if (!key.match(/\d+/)) {
        return formatPlainObjectKey.call(this, key);
      }
    },
    brackets: ['[', ']'],
    prefix: 'Arguments'
  });
}

function _formatDate(value, isUTC) {
  var prefix = isUTC ? 'UTC' : '';

  var date = value['get' + prefix + 'FullYear']() +
    '-' +
    pad0(value['get' + prefix + 'Month']() + 1, 2) +
    '-' +
    pad0(value['get' + prefix + 'Date'](), 2);

  var time = pad0(value['get' + prefix + 'Hours'](), 2) +
    ':' +
    pad0(value['get' + prefix + 'Minutes'](), 2) +
    ':' +
    pad0(value['get' + prefix + 'Seconds'](), 2) +
    '.' +
    pad0(value['get' + prefix + 'Milliseconds'](), 3);

  var to = value.getTimezoneOffset();
  var absTo = Math.abs(to);
  var hours = Math.floor(absTo / 60);
  var minutes = absTo - hours * 60;
  var tzFormat = (to < 0 ? '+' : '-') + pad0(hours, 2) + pad0(minutes, 2);

  return date + ' ' + time + (isUTC ? '' : ' ' + tzFormat);
}

function formatDate(value) {
  return formatPlainObject.call(this, value, { value: _formatDate(value, this.isUTCdate) });
}

function formatError(value) {
  return formatPlainObject.call(this, value, {
    prefix: value.name,
    additionalKeys: [['message', value.message]]
  });
}

function generateFormatForNumberArray(lengthProp, name, padding) {
  return function(value) {
    var max = this.byteArrayMaxLength || 50;
    var length = value[lengthProp];
    var formattedValues = [];
    var len = 0;
    for (var i = 0; i < max && i < length; i++) {
      var b = value[i] || 0;
      var v = pad0(b.toString(16), padding);
      len += v.length;
      formattedValues.push(v);
    }
    var prefix = value.constructor.name || name || '';
    if (prefix) {
      prefix += ' ';
    }

    if (formattedValues.length === 0) {
      return prefix + '[]';
    }

    if (len <= this.maxLineLength) {
      return prefix + '[ ' + formattedValues.join(this.propSep + ' ') + ' ' + ']';
    } else {
      return prefix + '[\n' + formattedValues.map(addSpaces).join(this.propSep + '\n') + '\n' + ']';
    }
  };
}

function formatMap(obj) {
  return typeAdaptorForEachFormat.call(this, obj, {
    keyValueSep: ' => '
  });
}

function formatSet(obj) {
  return typeAdaptorForEachFormat.call(this, obj, {
    keyValueSep: '',
    formatKey: function() { return ''; }
  });
}

function genSimdVectorFormat(constructorName, length) {
  return function(value) {
    var Constructor = value.constructor;
    var extractLane = Constructor.extractLane;

    var len = 0;
    var props = [];

    for (var i = 0; i < length; i ++) {
      var key = this.format(extractLane(value, i));
      len += key.length;
      props.push(key);
    }

    if (len <= this.maxLineLength) {
      return constructorName + ' [ ' + props.join(this.propSep + ' ') + ' ]';
    } else {
      return constructorName + ' [\n' + props.map(addSpaces).join(this.propSep + '\n') + '\n' + ']';
    }
  };
}

function defaultFormat(value, opts) {
  return new Formatter(opts).format(value);
}

defaultFormat.Formatter = Formatter;
defaultFormat.addSpaces = addSpaces;
defaultFormat.pad0 = pad0;
defaultFormat.functionName = functionName;
defaultFormat.constructorName = constructorName;
defaultFormat.formatPlainObjectKey = formatPlainObjectKey;
defaultFormat.formatPlainObject = formatPlainObject;
defaultFormat.typeAdaptorForEachFormat = typeAdaptorForEachFormat;
// adding primitive types
Formatter.addType(new t.Type(t.UNDEFINED), function() {
  return 'undefined';
});
Formatter.addType(new t.Type(t.NULL), function() {
  return 'null';
});
Formatter.addType(new t.Type(t.BOOLEAN), function(value) {
  return value ? 'true': 'false';
});
Formatter.addType(new t.Type(t.SYMBOL), function(value) {
  return value.toString();
});
Formatter.addType(new t.Type(t.NUMBER), function(value) {
  if (value === 0 && 1 / value < 0) {
    return '-0';
  }
  return String(value);
});

Formatter.addType(new t.Type(t.STRING), function(value) {
  return '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
      .replace(/'/g, "\\'")
      .replace(/\\"/g, '"') + '\'';
});

Formatter.addType(new t.Type(t.FUNCTION), formatFunction);

// plain object
Formatter.addType(new t.Type(t.OBJECT), formatPlainObject);

// type wrappers
Formatter.addType(new t.Type(t.OBJECT, t.NUMBER), formatWrapper1);
Formatter.addType(new t.Type(t.OBJECT, t.BOOLEAN), formatWrapper1);
Formatter.addType(new t.Type(t.OBJECT, t.STRING), formatWrapper2);

Formatter.addType(new t.Type(t.OBJECT, t.REGEXP), formatRegExp);
Formatter.addType(new t.Type(t.OBJECT, t.ARRAY), formatArray);
Formatter.addType(new t.Type(t.OBJECT, t.ARGUMENTS), formatArguments);
Formatter.addType(new t.Type(t.OBJECT, t.DATE), formatDate);
Formatter.addType(new t.Type(t.OBJECT, t.ERROR), formatError);
Formatter.addType(new t.Type(t.OBJECT, t.SET), formatSet);
Formatter.addType(new t.Type(t.OBJECT, t.MAP), formatMap);
Formatter.addType(new t.Type(t.OBJECT, t.WEAK_MAP), formatMap);
Formatter.addType(new t.Type(t.OBJECT, t.WEAK_SET), formatSet);

Formatter.addType(new t.Type(t.OBJECT, t.BUFFER), generateFormatForNumberArray('length', 'Buffer', 2));

Formatter.addType(new t.Type(t.OBJECT, t.ARRAY_BUFFER), generateFormatForNumberArray('byteLength', 'ArrayBuffer', 2));

Formatter.addType(new t.Type(t.OBJECT, t.TYPED_ARRAY, 'int8'), generateFormatForNumberArray('length', 'Int8Array', 2));
Formatter.addType(new t.Type(t.OBJECT, t.TYPED_ARRAY, 'uint8'), generateFormatForNumberArray('length', 'Uint8Array', 2));
Formatter.addType(new t.Type(t.OBJECT, t.TYPED_ARRAY, 'uint8clamped'), generateFormatForNumberArray('length', 'Uint8ClampedArray', 2));

Formatter.addType(new t.Type(t.OBJECT, t.TYPED_ARRAY, 'int16'), generateFormatForNumberArray('length', 'Int16Array', 4));
Formatter.addType(new t.Type(t.OBJECT, t.TYPED_ARRAY, 'uint16'), generateFormatForNumberArray('length', 'Uint16Array', 4));

Formatter.addType(new t.Type(t.OBJECT, t.TYPED_ARRAY, 'int32'), generateFormatForNumberArray('length', 'Int32Array', 8));
Formatter.addType(new t.Type(t.OBJECT, t.TYPED_ARRAY, 'uint32'), generateFormatForNumberArray('length', 'Uint32Array', 8));

Formatter.addType(new t.Type(t.OBJECT, t.SIMD, 'bool16x8'), genSimdVectorFormat('Bool16x8', 8));
Formatter.addType(new t.Type(t.OBJECT, t.SIMD, 'bool32x4'), genSimdVectorFormat('Bool32x4', 4));
Formatter.addType(new t.Type(t.OBJECT, t.SIMD, 'bool8x16'), genSimdVectorFormat('Bool8x16', 16));
Formatter.addType(new t.Type(t.OBJECT, t.SIMD, 'float32x4'), genSimdVectorFormat('Float32x4', 4));
Formatter.addType(new t.Type(t.OBJECT, t.SIMD, 'int16x8'), genSimdVectorFormat('Int16x8', 8));
Formatter.addType(new t.Type(t.OBJECT, t.SIMD, 'int32x4'), genSimdVectorFormat('Int32x4', 4));
Formatter.addType(new t.Type(t.OBJECT, t.SIMD, 'int8x16'), genSimdVectorFormat('Int8x16', 16));
Formatter.addType(new t.Type(t.OBJECT, t.SIMD, 'uint16x8'), genSimdVectorFormat('Uint16x8', 8));
Formatter.addType(new t.Type(t.OBJECT, t.SIMD, 'uint32x4'), genSimdVectorFormat('Uint32x4', 4));
Formatter.addType(new t.Type(t.OBJECT, t.SIMD, 'uint8x16'), genSimdVectorFormat('Uint8x16', 16));


Formatter.addType(new t.Type(t.OBJECT, t.PROMISE), function() {
  return '[Promise]';//TODO it could be nice to inspect its state and value
});

Formatter.addType(new t.Type(t.OBJECT, t.XHR), function() {
  return '[XMLHttpRequest]';//TODO it could be nice to inspect its state
});

Formatter.addType(new t.Type(t.OBJECT, t.HTML_ELEMENT), function(value) {
  return value.outerHTML;
});

Formatter.addType(new t.Type(t.OBJECT, t.HTML_ELEMENT, '#text'), function(value) {
  return value.nodeValue;
});

Formatter.addType(new t.Type(t.OBJECT, t.HTML_ELEMENT, '#document'), function(value) {
  return value.documentElement.outerHTML;
});

Formatter.addType(new t.Type(t.OBJECT, t.HOST), function() {
  return '[Host]';
});

module.exports = defaultFormat;
},{"should-type":10,"should-type-adaptors":9}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var shouldUtil = require('should-util');
var t = _interopDefault(require('should-type'));

// TODO in future add generators instead of forEach and iterator implementation


function ObjectIterator(obj) {
  this._obj = obj;
}

ObjectIterator.prototype = {
  __shouldIterator__: true, // special marker

  next: function() {
    if (this._done) {
      throw new Error('Iterator already reached the end');
    }

    if (!this._keys) {
      this._keys = Object.keys(this._obj);
      this._index = 0;
    }

    var key = this._keys[this._index];
    this._done = this._index === this._keys.length;
    this._index += 1;

    return {
      value: this._done ? void 0: [key, this._obj[key]],
      done: this._done
    };
  }
};

if (typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol') {
  ObjectIterator.prototype[Symbol.iterator] = function() {
    return this;
  };
}


function TypeAdaptorStorage() {
  this._typeAdaptors = [];
  this._iterableTypes = {};
}

TypeAdaptorStorage.prototype = {
  add: function(type, cls, sub, adaptor) {
    return this.addType(new t.Type(type, cls, sub), adaptor);
  },

  addType: function(type, adaptor) {
    this._typeAdaptors[type.toString()] = adaptor;
  },

  getAdaptor: function(tp, funcName) {
    var tries = tp.toTryTypes();
    while (tries.length) {
      var toTry = tries.shift();
      var ad = this._typeAdaptors[toTry];
      if (ad && ad[funcName]) {
        return ad[funcName];
      }
    }
  },

  requireAdaptor: function(tp, funcName) {
    var a = this.getAdaptor(tp, funcName);
    if (!a) {
      throw new Error('There is no type adaptor `' + funcName + '` for ' + tp.toString());
    }
    return a;
  },

  addIterableType: function(tp) {
    this._iterableTypes[tp.toString()] = true;
  },

  isIterableType: function(tp) {
    return !!this._iterableTypes[tp.toString()];
  }
};

var defaultTypeAdaptorStorage = new TypeAdaptorStorage();

var objectAdaptor = {
  forEach: function(obj, f, context) {
    for (var prop in obj) {
      if (shouldUtil.hasOwnProperty(obj, prop) && shouldUtil.propertyIsEnumerable(obj, prop)) {
        if (f.call(context, obj[prop], prop, obj) === false) {
          return;
        }
      }
    }
  },

  has: function(obj, prop) {
    return shouldUtil.hasOwnProperty(obj, prop);
  },

  get: function(obj, prop) {
    return obj[prop];
  },

  iterator: function(obj) {
    return new ObjectIterator(obj);
  }
};

// default for objects
defaultTypeAdaptorStorage.addType(new t.Type(t.OBJECT), objectAdaptor);
defaultTypeAdaptorStorage.addType(new t.Type(t.FUNCTION), objectAdaptor);

var mapAdaptor = {
  has: function(obj, key) {
    return obj.has(key);
  },

  get: function(obj, key) {
    return obj.get(key);
  },

  forEach: function(obj, f, context) {
    var iter = obj.entries();
    forEach(iter, function(value) {
      return f.call(context, value[1], value[0], obj);
    });
  },

  size: function(obj) {
    return obj.size;
  },

  isEmpty: function(obj) {
    return obj.size === 0;
  },

  iterator: function(obj) {
    return obj.entries();
  }
};

var setAdaptor = shouldUtil.merge({}, mapAdaptor);
setAdaptor.get = function(obj, key) {
  if (obj.has(key)) {
    return key;
  }
};
setAdaptor.iterator = function(obj) {
  return obj.values();
};

defaultTypeAdaptorStorage.addType(new t.Type(t.OBJECT, t.MAP), mapAdaptor);
defaultTypeAdaptorStorage.addType(new t.Type(t.OBJECT, t.SET), setAdaptor);
defaultTypeAdaptorStorage.addType(new t.Type(t.OBJECT, t.WEAK_SET), setAdaptor);
defaultTypeAdaptorStorage.addType(new t.Type(t.OBJECT, t.WEAK_MAP), mapAdaptor);

defaultTypeAdaptorStorage.addType(new t.Type(t.STRING), {
  isEmpty: function(obj) {
    return obj === '';
  },

  size: function(obj) {
    return obj.length;
  }
});

defaultTypeAdaptorStorage.addIterableType(new t.Type(t.OBJECT, t.ARRAY));
defaultTypeAdaptorStorage.addIterableType(new t.Type(t.OBJECT, t.ARGUMENTS));
defaultTypeAdaptorStorage.addIterableType(new t.Type(t.OBJECT, t.SET));

function forEach(obj, f, context) {
  if (shouldUtil.isGeneratorFunction(obj)) {
    return forEach(obj(), f, context);
  } else if (shouldUtil.isIterator(obj)) {
    var value = obj.next();
    while (!value.done) {
      if (f.call(context, value.value, 'value', obj) === false) {
        return;
      }
      value = obj.next();
    }
  } else {
    var type = t(obj);
    var func = defaultTypeAdaptorStorage.requireAdaptor(type, 'forEach');
    func(obj, f, context);
  }
}


function size(obj) {
  var type = t(obj);
  var func = defaultTypeAdaptorStorage.getAdaptor(type, 'size');
  if (func) {
    return func(obj);
  } else {
    var len = 0;
    forEach(obj, function() {
      len += 1;
    });
    return len;
  }
}

function isEmpty(obj) {
  var type = t(obj);
  var func = defaultTypeAdaptorStorage.getAdaptor(type, 'isEmpty');
  if (func) {
    return func(obj);
  } else {
    var res = true;
    forEach(obj, function() {
      res = false;
      return false;
    });
    return res;
  }
}

// return boolean if obj has such 'key'
function has(obj, key) {
  var type = t(obj);
  var func = defaultTypeAdaptorStorage.requireAdaptor(type, 'has');
  return func(obj, key);
}

// return value for given key
function get(obj, key) {
  var type = t(obj);
  var func = defaultTypeAdaptorStorage.requireAdaptor(type, 'get');
  return func(obj, key);
}

function reduce(obj, f, initialValue) {
  var res = initialValue;
  forEach(obj, function(value, key) {
    res = f(res, value, key, obj);
  });
  return res;
}

function some(obj, f, context) {
  var res = false;
  forEach(obj, function(value, key) {
    if (f.call(context, value, key, obj)) {
      res = true;
      return false;
    }
  }, context);
  return res;
}

function every(obj, f, context) {
  var res = true;
  forEach(obj, function(value, key) {
    if (!f.call(context, value, key, obj)) {
      res = false;
      return false;
    }
  }, context);
  return res;
}

function isIterable(obj) {
  return defaultTypeAdaptorStorage.isIterableType(t(obj));
}

function iterator(obj) {
  return defaultTypeAdaptorStorage.requireAdaptor(t(obj), 'iterator')(obj);
}

exports.defaultTypeAdaptorStorage = defaultTypeAdaptorStorage;
exports.forEach = forEach;
exports.size = size;
exports.isEmpty = isEmpty;
exports.has = has;
exports.get = get;
exports.reduce = reduce;
exports.some = some;
exports.every = every;
exports.isIterable = isIterable;
exports.iterator = iterator;
},{"should-type":10,"should-util":11}],10:[function(require,module,exports){
(function (Buffer){(function (){
'use strict';

var types = {
  NUMBER: 'number',
  UNDEFINED: 'undefined',
  STRING: 'string',
  BOOLEAN: 'boolean',
  OBJECT: 'object',
  FUNCTION: 'function',
  NULL: 'null',
  ARRAY: 'array',
  REGEXP: 'regexp',
  DATE: 'date',
  ERROR: 'error',
  ARGUMENTS: 'arguments',
  SYMBOL: 'symbol',
  ARRAY_BUFFER: 'array-buffer',
  TYPED_ARRAY: 'typed-array',
  DATA_VIEW: 'data-view',
  MAP: 'map',
  SET: 'set',
  WEAK_SET: 'weak-set',
  WEAK_MAP: 'weak-map',
  PROMISE: 'promise',

// node buffer
  BUFFER: 'buffer',

// dom html element
  HTML_ELEMENT: 'html-element',
  HTML_ELEMENT_TEXT: 'html-element-text',
  DOCUMENT: 'document',
  WINDOW: 'window',
  FILE: 'file',
  FILE_LIST: 'file-list',
  BLOB: 'blob',

  HOST: 'host',

  XHR: 'xhr',

  // simd
  SIMD: 'simd'
};

/*
 * Simple data function to store type information
 * @param {string} type Usually what is returned from typeof
 * @param {string} cls  Sanitized @Class via Object.prototype.toString
 * @param {string} sub  If type and cls the same, and need to specify somehow
 * @private
 * @example
 *
 * //for null
 * new Type('null');
 *
 * //for Date
 * new Type('object', 'date');
 *
 * //for Uint8Array
 *
 * new Type('object', 'typed-array', 'uint8');
 */
function Type(type, cls, sub) {
  if (!type) {
    throw new Error('Type class must be initialized at least with `type` information');
  }
  this.type = type;
  this.cls = cls;
  this.sub = sub;
}

Type.prototype = {
  toString: function(sep) {
    sep = sep || ';';
    var str = [this.type];
    if (this.cls) {
      str.push(this.cls);
    }
    if (this.sub) {
      str.push(this.sub);
    }
    return str.join(sep);
  },

  toTryTypes: function() {
    var _types = [];
    if (this.sub) {
      _types.push(new Type(this.type, this.cls, this.sub));
    }
    if (this.cls) {
      _types.push(new Type(this.type, this.cls));
    }
    _types.push(new Type(this.type));

    return _types;
  }
};

var toString = Object.prototype.toString;



/**
 * Function to store type checks
 * @private
 */
function TypeChecker() {
  this.checks = [];
}

TypeChecker.prototype = {
  add: function(func) {
    this.checks.push(func);
    return this;
  },

  addBeforeFirstMatch: function(obj, func) {
    var match = this.getFirstMatch(obj);
    if (match) {
      this.checks.splice(match.index, 0, func);
    } else {
      this.add(func);
    }
  },

  addTypeOf: function(type, res) {
    return this.add(function(obj, tpeOf) {
      if (tpeOf === type) {
        return new Type(res);
      }
    });
  },

  addClass: function(cls, res, sub) {
    return this.add(function(obj, tpeOf, objCls) {
      if (objCls === cls) {
        return new Type(types.OBJECT, res, sub);
      }
    });
  },

  getFirstMatch: function(obj) {
    var typeOf = typeof obj;
    var cls = toString.call(obj);

    for (var i = 0, l = this.checks.length; i < l; i++) {
      var res = this.checks[i].call(this, obj, typeOf, cls);
      if (typeof res !== 'undefined') {
        return { result: res, func: this.checks[i], index: i };
      }
    }
  },

  getType: function(obj) {
    var match = this.getFirstMatch(obj);
    return match && match.result;
  }
};

var main = new TypeChecker();

//TODO add iterators

main
  .addTypeOf(types.NUMBER, types.NUMBER)
  .addTypeOf(types.UNDEFINED, types.UNDEFINED)
  .addTypeOf(types.STRING, types.STRING)
  .addTypeOf(types.BOOLEAN, types.BOOLEAN)
  .addTypeOf(types.FUNCTION, types.FUNCTION)
  .addTypeOf(types.SYMBOL, types.SYMBOL)
  .add(function(obj) {
    if (obj === null) {
      return new Type(types.NULL);
    }
  })
  .addClass('[object String]', types.STRING)
  .addClass('[object Boolean]', types.BOOLEAN)
  .addClass('[object Number]', types.NUMBER)
  .addClass('[object Array]', types.ARRAY)
  .addClass('[object RegExp]', types.REGEXP)
  .addClass('[object Error]', types.ERROR)
  .addClass('[object Date]', types.DATE)
  .addClass('[object Arguments]', types.ARGUMENTS)

  .addClass('[object ArrayBuffer]', types.ARRAY_BUFFER)
  .addClass('[object Int8Array]', types.TYPED_ARRAY, 'int8')
  .addClass('[object Uint8Array]', types.TYPED_ARRAY, 'uint8')
  .addClass('[object Uint8ClampedArray]', types.TYPED_ARRAY, 'uint8clamped')
  .addClass('[object Int16Array]', types.TYPED_ARRAY, 'int16')
  .addClass('[object Uint16Array]', types.TYPED_ARRAY, 'uint16')
  .addClass('[object Int32Array]', types.TYPED_ARRAY, 'int32')
  .addClass('[object Uint32Array]', types.TYPED_ARRAY, 'uint32')
  .addClass('[object Float32Array]', types.TYPED_ARRAY, 'float32')
  .addClass('[object Float64Array]', types.TYPED_ARRAY, 'float64')

  .addClass('[object Bool16x8]', types.SIMD, 'bool16x8')
  .addClass('[object Bool32x4]', types.SIMD, 'bool32x4')
  .addClass('[object Bool8x16]', types.SIMD, 'bool8x16')
  .addClass('[object Float32x4]', types.SIMD, 'float32x4')
  .addClass('[object Int16x8]', types.SIMD, 'int16x8')
  .addClass('[object Int32x4]', types.SIMD, 'int32x4')
  .addClass('[object Int8x16]', types.SIMD, 'int8x16')
  .addClass('[object Uint16x8]', types.SIMD, 'uint16x8')
  .addClass('[object Uint32x4]', types.SIMD, 'uint32x4')
  .addClass('[object Uint8x16]', types.SIMD, 'uint8x16')

  .addClass('[object DataView]', types.DATA_VIEW)
  .addClass('[object Map]', types.MAP)
  .addClass('[object WeakMap]', types.WEAK_MAP)
  .addClass('[object Set]', types.SET)
  .addClass('[object WeakSet]', types.WEAK_SET)
  .addClass('[object Promise]', types.PROMISE)
  .addClass('[object Blob]', types.BLOB)
  .addClass('[object File]', types.FILE)
  .addClass('[object FileList]', types.FILE_LIST)
  .addClass('[object XMLHttpRequest]', types.XHR)
  .add(function(obj) {
    if ((typeof Promise === types.FUNCTION && obj instanceof Promise) ||
        (typeof obj.then === types.FUNCTION)) {
          return new Type(types.OBJECT, types.PROMISE);
        }
  })
  .add(function(obj) {
    if (typeof Buffer !== 'undefined' && obj instanceof Buffer) {// eslint-disable-line no-undef
      return new Type(types.OBJECT, types.BUFFER);
    }
  })
  .add(function(obj) {
    if (typeof Node !== 'undefined' && obj instanceof Node) {
      return new Type(types.OBJECT, types.HTML_ELEMENT, obj.nodeName);
    }
  })
  .add(function(obj) {
    // probably at the begginging should be enough these checks
    if (obj.Boolean === Boolean && obj.Number === Number && obj.String === String && obj.Date === Date) {
      return new Type(types.OBJECT, types.HOST);
    }
  })
  .add(function() {
    return new Type(types.OBJECT);
  });

/**
 * Get type information of anything
 *
 * @param  {any} obj Anything that could require type information
 * @return {Type}    type info
 * @private
 */
function getGlobalType(obj) {
  return main.getType(obj);
}

getGlobalType.checker = main;
getGlobalType.TypeChecker = TypeChecker;
getGlobalType.Type = Type;

Object.keys(types).forEach(function(typeName) {
  getGlobalType[typeName] = types[typeName];
});

module.exports = getGlobalType;
}).call(this)}).call(this,require("buffer").Buffer)
},{"buffer":5}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _hasOwnProperty = Object.prototype.hasOwnProperty;
var _propertyIsEnumerable = Object.prototype.propertyIsEnumerable;

function hasOwnProperty(obj, key) {
  return _hasOwnProperty.call(obj, key);
}

function propertyIsEnumerable(obj, key) {
  return _propertyIsEnumerable.call(obj, key);
}

function merge(a, b) {
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
    }
  }
  return a;
}

function isIterator(obj) {
  if (!obj) {
    return false;
  }

  if (obj.__shouldIterator__) {
    return true;
  }

  return typeof obj.next === 'function' &&
    typeof Symbol === 'function' &&
    typeof Symbol.iterator === 'symbol' &&
    typeof obj[Symbol.iterator] === 'function' &&
    obj[Symbol.iterator]() === obj;
}

//TODO find better way
function isGeneratorFunction(f) {
  return typeof f === 'function' && /^function\s*\*\s*/.test(f.toString());
}

exports.hasOwnProperty = hasOwnProperty;
exports.propertyIsEnumerable = propertyIsEnumerable;
exports.merge = merge;
exports.isIterator = isIterator;
exports.isGeneratorFunction = isGeneratorFunction;
},{}],12:[function(require,module,exports){
(function (global){(function (){
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var getType = _interopDefault(require('should-type'));
var eql = _interopDefault(require('should-equal'));
var sformat = _interopDefault(require('should-format'));
var shouldTypeAdaptors = require('should-type-adaptors');
var shouldUtil = require('should-util');

/*
 * should.js - assertion library
 * Copyright(c) 2010-2013 TJ Holowaychuk <tj@vision-media.ca>
 * Copyright(c) 2013-2017 Denis Bardadym <bardadymchik@gmail.com>
 * MIT Licensed
 */
function isWrapperType(obj) {
  return obj instanceof Number || obj instanceof String || obj instanceof Boolean;
}

// XXX make it more strict: numbers, strings, symbols - and nothing else
function convertPropertyName(name) {
  return typeof name === "symbol" ? name : String(name);
}

var functionName = sformat.functionName;

function isPlainObject(obj) {
  if (typeof obj == "object" && obj !== null) {
    var proto = Object.getPrototypeOf(obj);
    return proto === Object.prototype || proto === null;
  }

  return false;
}

/*
 * should.js - assertion library
 * Copyright(c) 2010-2013 TJ Holowaychuk <tj@vision-media.ca>
 * Copyright(c) 2013-2017 Denis Bardadym <bardadymchik@gmail.com>
 * MIT Licensed
 */

var config = {
  typeAdaptors: shouldTypeAdaptors.defaultTypeAdaptorStorage,

  getFormatter: function(opts) {
    return new sformat.Formatter(opts || config);
  }
};

function format(value, opts) {
  return config.getFormatter(opts).format(value);
}

function formatProp(value) {
  var formatter = config.getFormatter();
  return sformat.formatPlainObjectKey.call(formatter, value);
}

/*
 * should.js - assertion library
 * Copyright(c) 2010-2013 TJ Holowaychuk <tj@vision-media.ca>
 * Copyright(c) 2013-2017 Denis Bardadym <bardadymchik@gmail.com>
 * MIT Licensed
 */
/**
 * should AssertionError
 * @param {Object} options
 * @constructor
 * @memberOf should
 * @static
 */
function AssertionError(options) {
  shouldUtil.merge(this, options);

  if (!options.message) {
    Object.defineProperty(this, "message", {
      get: function() {
        if (!this._message) {
          this._message = this.generateMessage();
          this.generatedMessage = true;
        }
        return this._message;
      },
      configurable: true,
      enumerable: false
    });
  }

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.stackStartFunction);
  } else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      if (this.stackStartFunction) {
        // try to strip useless frames
        var fn_name = functionName(this.stackStartFunction);
        var idx = out.indexOf("\n" + fn_name);
        if (idx >= 0) {
          // once we have located the function frame
          // we need to strip out everything before it (and its line)
          var next_line = out.indexOf("\n", idx + 1);
          out = out.substring(next_line + 1);
        }
      }

      this.stack = out;
    }
  }
}

var indent = "    ";
function prependIndent(line) {
  return indent + line;
}

function indentLines(text) {
  return text
    .split("\n")
    .map(prependIndent)
    .join("\n");
}

// assert.AssertionError instanceof Error
AssertionError.prototype = Object.create(Error.prototype, {
  name: {
    value: "AssertionError"
  },

  generateMessage: {
    value: function() {
      if (!this.operator && this.previous) {
        return this.previous.message;
      }
      var actual = format(this.actual);
      var expected = "expected" in this ? " " + format(this.expected) : "";
      var details =
        "details" in this && this.details ? " (" + this.details + ")" : "";

      var previous = this.previous
        ? "\n" + indentLines(this.previous.message)
        : "";

      return (
        "expected " +
        actual +
        (this.negate ? " not " : " ") +
        this.operator +
        expected +
        details +
        previous
      );
    }
  }
});

/*
 * should.js - assertion library
 * Copyright(c) 2010-2013 TJ Holowaychuk <tj@vision-media.ca>
 * Copyright(c) 2013-2017 Denis Bardadym <bardadymchik@gmail.com>
 * MIT Licensed
 */

// a bit hacky way how to get error to do not have stack
function LightAssertionError(options) {
  shouldUtil.merge(this, options);

  if (!options.message) {
    Object.defineProperty(this, "message", {
      get: function() {
        if (!this._message) {
          this._message = this.generateMessage();
          this.generatedMessage = true;
        }
        return this._message;
      }
    });
  }
}

LightAssertionError.prototype = {
  generateMessage: AssertionError.prototype.generateMessage
};

/**
 * should Assertion
 * @param {*} obj Given object for assertion
 * @constructor
 * @memberOf should
 * @static
 */
function Assertion(obj) {
  this.obj = obj;

  this.anyOne = false;
  this.negate = false;

  this.params = { actual: obj };
}

Assertion.prototype = {
  constructor: Assertion,

  /**
   * Base method for assertions.
   *
   * Before calling this method need to fill Assertion#params object. This method usually called from other assertion methods.
   * `Assertion#params` can contain such properties:
   * * `operator` - required string containing description of this assertion
   * * `obj` - optional replacement for this.obj, it is useful if you prepare more clear object then given
   * * `message` - if this property filled with string any others will be ignored and this one used as assertion message
   * * `expected` - any object used when you need to assert relation between given object and expected. Like given == expected (== is a relation)
   * * `details` - additional string with details to generated message
   *
   * @memberOf Assertion
   * @category assertion
   * @param {*} expr Any expression that will be used as a condition for asserting.
   * @example
   *
   * var a = new should.Assertion(42);
   *
   * a.params = {
   *  operator: 'to be magic number',
   * }
   *
   * a.assert(false);
   * //throws AssertionError: expected 42 to be magic number
   */
  assert: function(expr) {
    if (expr) {
      return this;
    }

    var params = this.params;

    if ("obj" in params && !("actual" in params)) {
      params.actual = params.obj;
    } else if (!("obj" in params) && !("actual" in params)) {
      params.actual = this.obj;
    }

    params.stackStartFunction = params.stackStartFunction || this.assert;
    params.negate = this.negate;

    params.assertion = this;

    if (this.light) {
      throw new LightAssertionError(params);
    } else {
      throw new AssertionError(params);
    }
  },

  /**
   * Shortcut for `Assertion#assert(false)`.
   *
   * @memberOf Assertion
   * @category assertion
   * @example
   *
   * var a = new should.Assertion(42);
   *
   * a.params = {
   *  operator: 'to be magic number',
   * }
   *
   * a.fail();
   * //throws AssertionError: expected 42 to be magic number
   */
  fail: function() {
    return this.assert(false);
  },

  assertZeroArguments: function(args) {
    if (args.length !== 0) {
      throw new TypeError("This assertion does not expect any arguments. You may need to check your code");
    }
  }
};

/**
 * Assertion used to delegate calls of Assertion methods inside of Promise.
 * It has almost all methods of Assertion.prototype
 *
 * @param {Promise} obj
 */
function PromisedAssertion(/* obj */) {
  Assertion.apply(this, arguments);
}

/**
 * Make PromisedAssertion to look like promise. Delegate resolve and reject to given promise.
 *
 * @private
 * @returns {Promise}
 */
PromisedAssertion.prototype.then = function(resolve, reject) {
  return this.obj.then(resolve, reject);
};

/**
 * Way to extend Assertion function. It uses some logic
 * to define only positive assertions and itself rule with negative assertion.
 *
 * All actions happen in subcontext and this method take care about negation.
 * Potentially we can add some more modifiers that does not depends from state of assertion.
 *
 * @memberOf Assertion
 * @static
 * @param {String} name Name of assertion. It will be used for defining method or getter on Assertion.prototype
 * @param {Function} func Function that will be called on executing assertion
 * @example
 *
 * Assertion.add('asset', function() {
 *      this.params = { operator: 'to be asset' }
 *
 *      this.obj.should.have.property('id').which.is.a.Number()
 *      this.obj.should.have.property('path')
 * })
 */
Assertion.add = function(name, func) {
  Object.defineProperty(Assertion.prototype, name, {
    enumerable: true,
    configurable: true,
    value: function() {
      var context = new Assertion(this.obj, this, name);
      context.anyOne = this.anyOne;
      context.onlyThis = this.onlyThis;
      // hack
      context.light = true;

      try {
        func.apply(context, arguments);
      } catch (e) {
        // check for fail
        if (e instanceof AssertionError || e instanceof LightAssertionError) {
          // negative fail
          if (this.negate) {
            this.obj = context.obj;
            this.negate = false;
            return this;
          }

          if (context !== e.assertion) {
            context.params.previous = e;
          }

          // positive fail
          context.negate = false;
          // hack
          context.light = false;
          context.fail();
        }
        // throw if it is another exception
        throw e;
      }

      // negative pass
      if (this.negate) {
        context.negate = true; // because .fail will set negate
        context.params.details = "false negative fail";
        // hack
        context.light = false;
        context.fail();
      }

      // positive pass
      if (!this.params.operator) {
        this.params = context.params; // shortcut
      }
      this.obj = context.obj;
      this.negate = false;
      return this;
    }
  });

  Object.defineProperty(PromisedAssertion.prototype, name, {
    enumerable: true,
    configurable: true,
    value: function() {
      var args = arguments;
      this.obj = this.obj.then(function(a) {
        return a[name].apply(a, args);
      });

      return this;
    }
  });
};

/**
 * Add chaining getter to Assertion like .a, .which etc
 *
 * @memberOf Assertion
 * @static
 * @param  {string} name   name of getter
 * @param  {function} [onCall] optional function to call
 */
Assertion.addChain = function(name, onCall) {
  onCall = onCall || function() {};
  Object.defineProperty(Assertion.prototype, name, {
    get: function() {
      onCall.call(this);
      return this;
    },
    enumerable: true
  });

  Object.defineProperty(PromisedAssertion.prototype, name, {
    enumerable: true,
    configurable: true,
    get: function() {
      this.obj = this.obj.then(function(a) {
        return a[name];
      });

      return this;
    }
  });
};

/**
 * Create alias for some `Assertion` property
 *
 * @memberOf Assertion
 * @static
 * @param {String} from Name of to map
 * @param {String} to Name of alias
 * @example
 *
 * Assertion.alias('true', 'True')
 */
Assertion.alias = function(from, to) {
  var desc = Object.getOwnPropertyDescriptor(Assertion.prototype, from);
  if (!desc) {
    throw new Error("Alias " + from + " -> " + to + " could not be created as " + from + " not defined");
  }
  Object.defineProperty(Assertion.prototype, to, desc);

  var desc2 = Object.getOwnPropertyDescriptor(PromisedAssertion.prototype, from);
  if (desc2) {
    Object.defineProperty(PromisedAssertion.prototype, to, desc2);
  }
};
/**
 * Negation modifier. Current assertion chain become negated. Each call invert negation on current assertion.
 *
 * @name not
 * @property
 * @memberOf Assertion
 * @category assertion
 */
Assertion.addChain("not", function() {
  this.negate = !this.negate;
});

/**
 * Any modifier - it affect on execution of sequenced assertion to do not `check all`, but `check any of`.
 *
 * @name any
 * @property
 * @memberOf Assertion
 * @category assertion
 */
Assertion.addChain("any", function() {
  this.anyOne = true;
});

/**
 * Only modifier - currently used with .keys to check if object contains only exactly this .keys
 *
 * @name only
 * @property
 * @memberOf Assertion
 * @category assertion
 */
Assertion.addChain("only", function() {
  this.onlyThis = true;
});

// implement assert interface using already written peaces of should.js

// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// when used in node, this will actually load the util module we depend on
// versus loading the builtin util module as happens otherwise
// this is a bug in node module loading as far as I am concerned
var pSlice = Array.prototype.slice;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = ok;
// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.
/**
 * Node.js standard [`assert.fail`](http://nodejs.org/api/assert.html#assert_assert_fail_actual_expected_message_operator).
 * @static
 * @memberOf should
 * @category assertion assert
 * @param {*} actual Actual object
 * @param {*} expected Expected object
 * @param {string} message Message for assertion
 * @param {string} operator Operator text
 */
function fail(actual, expected, message, operator, stackStartFunction) {
  var a = new Assertion(actual);
  a.params = {
    operator: operator,
    expected: expected,
    message: message,
    stackStartFunction: stackStartFunction || fail
  };

  a.fail();
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.
/**
 * Node.js standard [`assert.ok`](http://nodejs.org/api/assert.html#assert_assert_value_message_assert_ok_value_message).
 * @static
 * @memberOf should
 * @category assertion assert
 * @param {*} value
 * @param {string} [message]
 */
function ok(value, message) {
  if (!value) {
    fail(value, true, message, "==", assert.ok);
  }
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

/**
 * Node.js standard [`assert.equal`](http://nodejs.org/api/assert.html#assert_assert_equal_actual_expected_message).
 * @static
 * @memberOf should
 * @category assertion assert
 * @param {*} actual
 * @param {*} expected
 * @param {string} [message]
 */
assert.equal = function equal(actual, expected, message) {
  if (actual != expected) {
    fail(actual, expected, message, "==", assert.equal);
  }
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);
/**
 * Node.js standard [`assert.notEqual`](http://nodejs.org/api/assert.html#assert_assert_notequal_actual_expected_message).
 * @static
 * @memberOf should
 * @category assertion assert
 * @param {*} actual
 * @param {*} expected
 * @param {string} [message]
 */
assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, "!=", assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);
/**
 * Node.js standard [`assert.deepEqual`](http://nodejs.org/api/assert.html#assert_assert_deepequal_actual_expected_message).
 * But uses should.js .eql implementation instead of Node.js own deepEqual.
 *
 * @static
 * @memberOf should
 * @category assertion assert
 * @param {*} actual
 * @param {*} expected
 * @param {string} [message]
 */
assert.deepEqual = function deepEqual(actual, expected, message) {
  if (eql(actual, expected).length !== 0) {
    fail(actual, expected, message, "deepEqual", assert.deepEqual);
  }
};

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);
/**
 * Node.js standard [`assert.notDeepEqual`](http://nodejs.org/api/assert.html#assert_assert_notdeepequal_actual_expected_message).
 * But uses should.js .eql implementation instead of Node.js own deepEqual.
 *
 * @static
 * @memberOf should
 * @category assertion assert
 * @param {*} actual
 * @param {*} expected
 * @param {string} [message]
 */
assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (eql(actual, expected).result) {
    fail(actual, expected, message, "notDeepEqual", assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);
/**
 * Node.js standard [`assert.strictEqual`](http://nodejs.org/api/assert.html#assert_assert_strictequal_actual_expected_message).
 * @static
 * @memberOf should
 * @category assertion assert
 * @param {*} actual
 * @param {*} expected
 * @param {string} [message]
 */
assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, "===", assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);
/**
 * Node.js standard [`assert.notStrictEqual`](http://nodejs.org/api/assert.html#assert_assert_notstrictequal_actual_expected_message).
 * @static
 * @memberOf should
 * @category assertion assert
 * @param {*} actual
 * @param {*} expected
 * @param {string} [message]
 */
assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, "!==", assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == "[object RegExp]") {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof expected == "string") {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message =
    (expected && expected.name ? " (" + expected.name + ")" : ".") +
    (message ? " " + message : ".");

  if (shouldThrow && !actual) {
    fail(actual, expected, "Missing expected exception" + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, "Got unwanted exception" + message);
  }

  if (
    (shouldThrow &&
      actual &&
      expected &&
      !expectedException(actual, expected)) ||
    (!shouldThrow && actual)
  ) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);
/**
 * Node.js standard [`assert.throws`](http://nodejs.org/api/assert.html#assert_assert_throws_block_error_message).
 * @static
 * @memberOf should
 * @category assertion assert
 * @param {Function} block
 * @param {Function} [error]
 * @param {String} [message]
 */
assert.throws = function(/*block, error, message*/) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
/**
 * Node.js standard [`assert.doesNotThrow`](http://nodejs.org/api/assert.html#assert_assert_doesnotthrow_block_message).
 * @static
 * @memberOf should
 * @category assertion assert
 * @param {Function} block
 * @param {String} [message]
 */
assert.doesNotThrow = function(/*block, message*/) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

/**
 * Node.js standard [`assert.ifError`](http://nodejs.org/api/assert.html#assert_assert_iferror_value).
 * @static
 * @memberOf should
 * @category assertion assert
 * @param {Error} err
 */
assert.ifError = function(err) {
  if (err) {
    throw err;
  }
};

/*
 * should.js - assertion library
 * Copyright(c) 2010-2013 TJ Holowaychuk <tj@vision-media.ca>
 * Copyright(c) 2013-2017 Denis Bardadym <bardadymchik@gmail.com>
 * MIT Licensed
 */

function assertExtensions(should) {
  var i = should.format;

  /*
   * Expose assert to should
   *
   * This allows you to do things like below
   * without require()ing the assert module.
   *
   *    should.equal(foo.bar, undefined);
   *
   */
  shouldUtil.merge(should, assert);

  /**
   * Assert _obj_ exists, with optional message.
   *
   * @static
   * @memberOf should
   * @category assertion assert
   * @alias should.exists
   * @param {*} obj
   * @param {String} [msg]
   * @example
   *
   * should.exist(1);
   * should.exist(new Date());
   */
  should.exist = should.exists = function(obj, msg) {
    if (null == obj) {
      throw new AssertionError({
        message: msg || "expected " + i(obj) + " to exist",
        stackStartFunction: should.exist
      });
    }
  };

  should.not = {};
  /**
   * Asserts _obj_ does not exist, with optional message.
   *
   * @name not.exist
   * @static
   * @memberOf should
   * @category assertion assert
   * @alias should.not.exists
   * @param {*} obj
   * @param {String} [msg]
   * @example
   *
   * should.not.exist(null);
   * should.not.exist(void 0);
   */
  should.not.exist = should.not.exists = function(obj, msg) {
    if (null != obj) {
      throw new AssertionError({
        message: msg || "expected " + i(obj) + " to not exist",
        stackStartFunction: should.not.exist
      });
    }
  };
}

/*
 * should.js - assertion library
 * Copyright(c) 2010-2013 TJ Holowaychuk <tj@vision-media.ca>
 * Copyright(c) 2013-2017 Denis Bardadym <bardadymchik@gmail.com>
 * MIT Licensed
 */

function chainAssertions(should, Assertion) {
  /**
   * Simple chaining to improve readability. Does nothing.
   *
   * @memberOf Assertion
   * @name be
   * @property {should.Assertion} be
   * @alias Assertion#an
   * @alias Assertion#of
   * @alias Assertion#a
   * @alias Assertion#and
   * @alias Assertion#been
   * @alias Assertion#have
   * @alias Assertion#has
   * @alias Assertion#with
   * @alias Assertion#is
   * @alias Assertion#which
   * @alias Assertion#the
   * @alias Assertion#it
   * @category assertion chaining
   */
  [
    "an",
    "of",
    "a",
    "and",
    "be",
    "been",
    "has",
    "have",
    "with",
    "is",
    "which",
    "the",
    "it"
  ].forEach(function(name) {
    Assertion.addChain(name);
  });
}

/*
 * should.js - assertion library
 * Copyright(c) 2010-2013 TJ Holowaychuk <tj@vision-media.ca>
 * Copyright(c) 2013-2017 Denis Bardadym <bardadymchik@gmail.com>
 * MIT Licensed
 */

function booleanAssertions(should, Assertion) {
  /**
   * Assert given object is exactly `true`.
   *
   * @name true
   * @memberOf Assertion
   * @category assertion bool
   * @alias Assertion#True
   * @param {string} [message] Optional message
   * @example
   *
   * (true).should.be.true();
   * false.should.not.be.true();
   *
   * ({ a: 10}).should.not.be.true();
   */
  Assertion.add("true", function(message) {
    this.is.exactly(true, message);
  });

  Assertion.alias("true", "True");

  /**
   * Assert given object is exactly `false`.
   *
   * @name false
   * @memberOf Assertion
   * @category assertion bool
   * @alias Assertion#False
   * @param {string} [message] Optional message
   * @example
   *
   * (true).should.not.be.false();
   * false.should.be.false();
   */
  Assertion.add("false", function(message) {
    this.is.exactly(false, message);
  });

  Assertion.alias("false", "False");

  /**
   * Assert given object is truthy according javascript type conversions.
   *
   * @name ok
   * @memberOf Assertion
   * @category assertion bool
   * @example
   *
   * (true).should.be.ok();
   * ''.should.not.be.ok();
   * should(null).not.be.ok();
   * should(void 0).not.be.ok();
   *
   * (10).should.be.ok();
   * (0).should.not.be.ok();
   */
  Assertion.add("ok", function() {
    this.assertZeroArguments(arguments);
    this.params = { operator: "to be truthy" };

    this.assert(this.obj);
  });
}

/*
 * should.js - assertion library
 * Copyright(c) 2010-2013 TJ Holowaychuk <tj@vision-media.ca>
 * Copyright(c) 2013-2017 Denis Bardadym <bardadymchik@gmail.com>
 * MIT Licensed
 */

function numberAssertions(should, Assertion) {
  /**
   * Assert given object is NaN
   * @name NaN
   * @memberOf Assertion
   * @category assertion numbers
   * @example
   *
   * (10).should.not.be.NaN();
   * NaN.should.be.NaN();
   */
  Assertion.add("NaN", function() {
    this.assertZeroArguments(arguments);
    this.params = { operator: "to be NaN" };

    this.assert(this.obj !== this.obj);
  });

  /**
   * Assert given object is not finite (positive or negative)
   *
   * @name Infinity
   * @memberOf Assertion
   * @category assertion numbers
   * @example
   *
   * (10).should.not.be.Infinity();
   * NaN.should.not.be.Infinity();
   */
  Assertion.add("Infinity", function() {
    this.assertZeroArguments(arguments);
    this.params = { operator: "to be Infinity" };

    this.is.a
      .Number()
      .and.not.a.NaN()
      .and.assert(!isFinite(this.obj));
  });

  /**
   * Assert given number between `start` and `finish` or equal one of them.
   *
   * @name within
   * @memberOf Assertion
   * @category assertion numbers
   * @param {number} start Start number
   * @param {number} finish Finish number
   * @param {string} [description] Optional message
   * @example
   *
   * (10).should.be.within(0, 20);
   */
  Assertion.add("within", function(start, finish, description) {
    this.params = {
      operator: "to be within " + start + ".." + finish,
      message: description
    };

    this.assert(this.obj >= start && this.obj <= finish);
  });

  /**
   * Assert given number near some other `value` within `delta`
   *
   * @name approximately
   * @memberOf Assertion
   * @category assertion numbers
   * @param {number} value Center number
   * @param {number} delta Radius
   * @param {string} [description] Optional message
   * @example
   *
   * (9.99).should.be.approximately(10, 0.1);
   */
  Assertion.add("approximately", function(value, delta, description) {
    this.params = {
      operator: "to be approximately " + value + " ±" + delta,
      message: description
    };

    this.assert(Math.abs(this.obj - value) <= delta);
  });

  /**
   * Assert given number above `n`.
   *
   * @name above
   * @alias Assertion#greaterThan
   * @memberOf Assertion
   * @category assertion numbers
   * @param {number} n Margin number
   * @param {string} [description] Optional message
   * @example
   *
   * (10).should.be.above(0);
   */
  Assertion.add("above", function(n, description) {
    this.params = { operator: "to be above " + n, message: description };

    this.assert(this.obj > n);
  });

  /**
   * Assert given number below `n`.
   *
   * @name below
   * @alias Assertion#lessThan
   * @memberOf Assertion
   * @category assertion numbers
   * @param {number} n Margin number
   * @param {string} [description] Optional message
   * @example
   *
   * (0).should.be.below(10);
   */
  Assertion.add("below", function(n, description) {
    this.params = { operator: "to be below " + n, message: description };

    this.assert(this.obj < n);
  });

  Assertion.alias("above", "greaterThan");
  Assertion.alias("below", "lessThan");

  /**
   * Assert given number above `n`.
   *
   * @name aboveOrEqual
   * @alias Assertion#greaterThanOrEqual
   * @memberOf Assertion
   * @category assertion numbers
   * @param {number} n Margin number
   * @param {string} [description] Optional message
   * @example
   *
   * (10).should.be.aboveOrEqual(0);
   * (10).should.be.aboveOrEqual(10);
   */
  Assertion.add("aboveOrEqual", function(n, description) {
    this.params = {
      operator: "to be above or equal " + n,
      message: description
    };

    this.assert(this.obj >= n);
  });

  /**
   * Assert given number below `n`.
   *
   * @name belowOrEqual
   * @alias Assertion#lessThanOrEqual
   * @memberOf Assertion
   * @category assertion numbers
   * @param {number} n Margin number
   * @param {string} [description] Optional message
   * @example
   *
   * (0).should.be.belowOrEqual(10);
   * (0).should.be.belowOrEqual(0);
   */
  Assertion.add("belowOrEqual", function(n, description) {
    this.params = {
      operator: "to be below or equal " + n,
      message: description
    };

    this.assert(this.obj <= n);
  });

  Assertion.alias("aboveOrEqual", "greaterThanOrEqual");
  Assertion.alias("belowOrEqual", "lessThanOrEqual");
}

/*
 * should.js - assertion library
 * Copyright(c) 2010-2013 TJ Holowaychuk <tj@vision-media.ca>
 * Copyright(c) 2013-2017 Denis Bardadym <bardadymchik@gmail.com>
 * MIT Licensed
 */

function typeAssertions(should, Assertion) {
  /**
   * Assert given object is number
   * @name Number
   * @memberOf Assertion
   * @category assertion types
   */
  Assertion.add("Number", function() {
    this.assertZeroArguments(arguments);
    this.params = { operator: "to be a number" };

    this.have.type("number");
  });

  /**
   * Assert given object is arguments
   * @name arguments
   * @alias Assertion#Arguments
   * @memberOf Assertion
   * @category assertion types
   */
  Assertion.add("arguments", function() {
    this.assertZeroArguments(arguments);
    this.params = { operator: "to be arguments" };

    this.have.class("Arguments");
  });

  Assertion.alias("arguments", "Arguments");

  /**
   * Assert given object has some type using `typeof`
   * @name type
   * @memberOf Assertion
   * @param {string} type Type name
   * @param {string} [description] Optional message
   * @category assertion types
   */
  Assertion.add("type", function(type, description) {
    this.params = { operator: "to have type " + type, message: description };

    should(typeof this.obj).be.exactly(type);
  });

  /**
   * Assert given object is instance of `constructor`
   * @name instanceof
   * @alias Assertion#instanceOf
   * @memberOf Assertion
   * @param {Function} constructor Constructor function
   * @param {string} [description] Optional message
   * @category assertion types
   */
  Assertion.add("instanceof", function(constructor, description) {
    this.params = {
      operator: "to be an instance of " + functionName(constructor),
      message: description
    };

    this.assert(Object(this.obj) instanceof constructor);
  });

  Assertion.alias("instanceof", "instanceOf");

  /**
   * Assert given object is function
   * @name Function
   * @memberOf Assertion
   * @category assertion types
   */
  Assertion.add("Function", function() {
    this.assertZeroArguments(arguments);
    this.params = { operator: "to be a function" };

    this.have.type("function");
  });

  /**
   * Assert given object is object
   * @name Object
   * @memberOf Assertion
   * @category assertion types
   */
  Assertion.add("Object", function() {
    this.assertZeroArguments(arguments);
    this.params = { operator: "to be an object" };

    this.is.not.null().and.have.type("object");
  });

  /**
   * Assert given object is string
   * @name String
   * @memberOf Assertion
   * @category assertion types
   */
  Assertion.add("String", function() {
    this.assertZeroArguments(arguments);
    this.params = { operator: "to be a string" };

    this.have.type("string");
  });

  /**
   * Assert given object is array
   * @name Array
   * @memberOf Assertion
   * @category assertion types
   */
  Assertion.add("Array", function() {
    this.assertZeroArguments(arguments);
    this.params = { operator: "to be an array" };

    this.have.class("Array");
  });

  /**
   * Assert given object is boolean
   * @name Boolean
   * @memberOf Assertion
   * @category assertion types
   */
  Assertion.add("Boolean", function() {
    this.assertZeroArguments(arguments);
    this.params = { operator: "to be a boolean" };

    this.have.type("boolean");
  });

  /**
   * Assert given object is error
   * @name Error
   * @memberOf Assertion
   * @category assertion types
   */
  Assertion.add("Error", function() {
    this.assertZeroArguments(arguments);
    this.params = { operator: "to be an error" };

    this.have.instanceOf(Error);
  });

  /**
   * Assert given object is a date
   * @name Date
   * @memberOf Assertion
   * @category assertion types
   */
  Assertion.add("Date", function() {
    this.assertZeroArguments(arguments);
    this.params = { operator: "to be a date" };

    this.have.instanceOf(Date);
  });

  /**
   * Assert given object is null
   * @name null
   * @alias Assertion#Null
   * @memberOf Assertion
   * @category assertion types
   */
  Assertion.add("null", function() {
    this.assertZeroArguments(arguments);
    this.params = { operator: "to be null" };

    this.assert(this.obj === null);
  });

  Assertion.alias("null", "Null");

  /**
   * Assert given object has some internal [[Class]], via Object.prototype.toString call
   * @name class
   * @alias Assertion#Class
   * @memberOf Assertion
   * @category assertion types
   */
  Assertion.add("class", function(cls) {
    this.params = { operator: "to have [[Class]] " + cls };

    this.assert(Object.prototype.toString.call(this.obj) === "[object " + cls + "]");
  });

  Assertion.alias("class", "Class");

  /**
   * Assert given object is undefined
   * @name undefined
   * @alias Assertion#Undefined
   * @memberOf Assertion
   * @category assertion types
   */
  Assertion.add("undefined", function() {
    this.assertZeroArguments(arguments);
    this.params = { operator: "to be undefined" };

    this.assert(this.obj === void 0);
  });

  Assertion.alias("undefined", "Undefined");

  /**
   * Assert given object supports es6 iterable protocol (just check
   * that object has property Symbol.iterator, which is a function)
   * @name iterable
   * @memberOf Assertion
   * @category assertion es6
   */
  Assertion.add("iterable", function() {
    this.assertZeroArguments(arguments);
    this.params = { operator: "to be iterable" };

    should(this.obj)
      .have.property(Symbol.iterator)
      .which.is.a.Function();
  });

  /**
   * Assert given object supports es6 iterator protocol (just check
   * that object has property next, which is a function)
   * @name iterator
   * @memberOf Assertion
   * @category assertion es6
   */
  Assertion.add("iterator", function() {
    this.assertZeroArguments(arguments);
    this.params = { operator: "to be iterator" };

    should(this.obj)
      .have.property("next")
      .which.is.a.Function();
  });

  /**
   * Assert given object is a generator object
   * @name generator
   * @memberOf Assertion
   * @category assertion es6
   */
  Assertion.add("generator", function() {
    this.assertZeroArguments(arguments);
    this.params = { operator: "to be generator" };

    should(this.obj).be.iterable.and.iterator.and.it.is.equal(this.obj[Symbol.iterator]());
  });
}

/*
 * should.js - assertion library
 * Copyright(c) 2010-2013 TJ Holowaychuk <tj@vision-media.ca>
 * Copyright(c) 2013-2017 Denis Bardadym <bardadymchik@gmail.com>
 * MIT Licensed
 */

function formatEqlResult(r, a, b) {
  return ((r.path.length > 0
    ? "at " + r.path.map(formatProp).join(" -> ")
    : "") +
    (r.a === a ? "" : ", A has " + format(r.a)) +
    (r.b === b ? "" : " and B has " + format(r.b)) +
    (r.showReason ? " because " + r.reason : "")).trim();
}

function equalityAssertions(should, Assertion) {
  /**
   * Deep object equality comparison. For full spec see [`should-equal tests`](https://github.com/shouldjs/equal/blob/master/test.js).
   *
   * @name eql
   * @memberOf Assertion
   * @category assertion equality
   * @alias Assertion#eqls
   * @alias Assertion#deepEqual
   * @param {*} val Expected value
   * @param {string} [description] Optional message
   * @example
   *
   * (10).should.be.eql(10);
   * ('10').should.not.be.eql(10);
   * (-0).should.not.be.eql(+0);
   *
   * NaN.should.be.eql(NaN);
   *
   * ({ a: 10}).should.be.eql({ a: 10 });
   * [ 'a' ].should.not.be.eql({ '0': 'a' });
   */
  Assertion.add("eql", function(val, description) {
    this.params = { operator: "to equal", expected: val, message: description };
    var obj = this.obj;
    var fails = eql(this.obj, val, should.config);
    this.params.details = fails
      .map(function(fail) {
        return formatEqlResult(fail, obj, val);
      })
      .join(", ");

    this.params.showDiff = eql(getType(obj), getType(val)).length === 0;

    this.assert(fails.length === 0);
  });

  /**
   * Exact comparison using ===.
   *
   * @name equal
   * @memberOf Assertion
   * @category assertion equality
   * @alias Assertion#equals
   * @alias Assertion#exactly
   * @param {*} val Expected value
   * @param {string} [description] Optional message
   * @example
   *
   * 10.should.be.equal(10);
   * 'a'.should.be.exactly('a');
   *
   * should(null).be.exactly(null);
   */
  Assertion.add("equal", function(val, description) {
    this.params = { operator: "to be", expected: val, message: description };

    this.params.showDiff = eql(getType(this.obj), getType(val)).length === 0;

    this.assert(val === this.obj);
  });

  Assertion.alias("equal", "equals");
  Assertion.alias("equal", "exactly");
  Assertion.alias("eql", "eqls");
  Assertion.alias("eql", "deepEqual");

  function addOneOf(name, message, method) {
    Assertion.add(name, function(vals) {
      if (arguments.length !== 1) {
        vals = Array.prototype.slice.call(arguments);
      } else {
        should(vals).be.Array();
      }

      this.params = { operator: message, expected: vals };

      var obj = this.obj;
      var found = false;

      shouldTypeAdaptors.forEach(vals, function(val) {
        try {
          should(val)[method](obj);
          found = true;
          return false;
        } catch (e) {
          if (e instanceof should.AssertionError) {
            return; //do nothing
          }
          throw e;
        }
      });

      this.assert(found);
    });
  }

  /**
   * Exact comparison using === to be one of supplied objects.
   *
   * @name equalOneOf
   * @memberOf Assertion
   * @category assertion equality
   * @param {Array|*} vals Expected values
   * @example
   *
   * 'ab'.should.be.equalOneOf('a', 10, 'ab');
   * 'ab'.should.be.equalOneOf(['a', 10, 'ab']);
   */
  addOneOf("equalOneOf", "to be equals one of", "equal");

  /**
   * Exact comparison using .eql to be one of supplied objects.
   *
   * @name oneOf
   * @memberOf Assertion
   * @category assertion equality
   * @param {Array|*} vals Expected values
   * @example
   *
   * ({a: 10}).should.be.oneOf('a', 10, 'ab', {a: 10});
   * ({a: 10}).should.be.oneOf(['a', 10, 'ab', {a: 10}]);
   */
  addOneOf("oneOf", "to be one of", "eql");
}

/*
 * should.js - assertion library
 * Copyright(c) 2010-2013 TJ Holowaychuk <tj@vision-media.ca>
 * Copyright(c) 2013-2017 Denis Bardadym <bardadymchik@gmail.com>
 * MIT Licensed
 */

function promiseAssertions(should, Assertion$$1) {
  /**
   * Assert given object is a Promise
   *
   * @name Promise
   * @memberOf Assertion
   * @category assertion promises
   * @example
   *
   * promise.should.be.Promise()
   * (new Promise(function(resolve, reject) { resolve(10); })).should.be.a.Promise()
   * (10).should.not.be.a.Promise()
   */
  Assertion$$1.add("Promise", function() {
    this.assertZeroArguments(arguments);
    this.params = { operator: "to be promise" };

    var obj = this.obj;

    should(obj)
      .have.property("then")
      .which.is.a.Function();
  });

  /**
   * Assert given promise will be fulfilled. Result of assertion is still .thenable and should be handled accordingly.
   *
   * @name fulfilled
   * @memberOf Assertion
   * @alias Assertion#resolved
   * @returns {Promise}
   * @category assertion promises
   * @example
   *
   * // don't forget to handle async nature
   * (new Promise(function(resolve, reject) { resolve(10); })).should.be.fulfilled();
   *
   * // test example with mocha it is possible to return promise
   * it('is async', () => {
   *    return new Promise(resolve => resolve(10))
   *      .should.be.fulfilled();
   * });
   */
  Assertion$$1.prototype.fulfilled = function Assertion$fulfilled() {
    this.assertZeroArguments(arguments);
    this.params = { operator: "to be fulfilled" };

    should(this.obj).be.a.Promise();

    var that = this;
    return this.obj.then(
      function next$onResolve(value) {
        if (that.negate) {
          that.fail();
        }
        return value;
      },
      function next$onReject(err) {
        if (!that.negate) {
          that.params.operator += ", but it was rejected with " + should.format(err);
          that.fail();
        }
        return err;
      }
    );
  };

  Assertion$$1.prototype.resolved = Assertion$$1.prototype.fulfilled;

  /**
   * Assert given promise will be rejected. Result of assertion is still .thenable and should be handled accordingly.
   *
   * @name rejected
   * @memberOf Assertion
   * @category assertion promises
   * @returns {Promise}
   * @example
   *
   * // don't forget to handle async nature
   * (new Promise(function(resolve, reject) { resolve(10); }))
   *    .should.not.be.rejected();
   *
   * // test example with mocha it is possible to return promise
   * it('is async', () => {
   *    return new Promise((resolve, reject) => reject(new Error('boom')))
   *      .should.be.rejected();
   * });
   */
  Assertion$$1.prototype.rejected = function() {
    this.assertZeroArguments(arguments);
    this.params = { operator: "to be rejected" };

    should(this.obj).be.a.Promise();

    var that = this;
    return this.obj.then(
      function(value) {
        if (!that.negate) {
          that.params.operator += ", but it was fulfilled";
          if (arguments.length != 0) {
            that.params.operator += " with " + should.format(value);
          }
          that.fail();
        }
        return value;
      },
      function next$onError(err) {
        if (that.negate) {
          that.fail();
        }
        return err;
      }
    );
  };

  /**
   * Assert given promise will be fulfilled with some expected value (value compared using .eql).
   * Result of assertion is still .thenable and should be handled accordingly.
   *
   * @name fulfilledWith
   * @memberOf Assertion
   * @alias Assertion#resolvedWith
   * @category assertion promises
   * @returns {Promise}
   * @example
   *
   * // don't forget to handle async nature
   * (new Promise(function(resolve, reject) { resolve(10); }))
   *    .should.be.fulfilledWith(10);
   *
   * // test example with mocha it is possible to return promise
   * it('is async', () => {
   *    return new Promise((resolve, reject) => resolve(10))
   *       .should.be.fulfilledWith(10);
   * });
   */
  Assertion$$1.prototype.fulfilledWith = function(expectedValue) {
    this.params = {
      operator: "to be fulfilled with " + should.format(expectedValue)
    };

    should(this.obj).be.a.Promise();

    var that = this;
    return this.obj.then(
      function(value) {
        if (that.negate) {
          that.fail();
        }
        should(value).eql(expectedValue);
        return value;
      },
      function next$onError(err) {
        if (!that.negate) {
          that.params.operator += ", but it was rejected with " + should.format(err);
          that.fail();
        }
        return err;
      }
    );
  };

  Assertion$$1.prototype.resolvedWith = Assertion$$1.prototype.fulfilledWith;

  /**
   * Assert given promise will be rejected with some sort of error. Arguments is the same for Assertion#throw.
   * Result of assertion is still .thenable and should be handled accordingly.
   *
   * @name rejectedWith
   * @memberOf Assertion
   * @category assertion promises
   * @returns {Promise}
   * @example
   *
   * function failedPromise() {
   *   return new Promise(function(resolve, reject) {
   *     reject(new Error('boom'))
   *   })
   * }
   * failedPromise().should.be.rejectedWith(Error);
   * failedPromise().should.be.rejectedWith('boom');
   * failedPromise().should.be.rejectedWith(/boom/);
   * failedPromise().should.be.rejectedWith(Error, { message: 'boom' });
   * failedPromise().should.be.rejectedWith({ message: 'boom' });
   *
   * // test example with mocha it is possible to return promise
   * it('is async', () => {
   *    return failedPromise().should.be.rejectedWith({ message: 'boom' });
   * });
   */
  Assertion$$1.prototype.rejectedWith = function(message, properties) {
    this.params = { operator: "to be rejected" };

    should(this.obj).be.a.Promise();

    var that = this;
    return this.obj.then(
      function(value) {
        if (!that.negate) {
          that.fail();
        }
        return value;
      },
      function next$onError(err) {
        if (that.negate) {
          that.fail();
        }

        var errorMatched = true;
        var errorInfo = "";

        if ("string" === typeof message) {
          errorMatched = message === err.message;
        } else if (message instanceof RegExp) {
          errorMatched = message.test(err.message);
        } else if ("function" === typeof message) {
          errorMatched = err instanceof message;
        } else if (message !== null && typeof message === "object") {
          try {
            should(err).match(message);
          } catch (e) {
            if (e instanceof should.AssertionError) {
              errorInfo = ": " + e.message;
              errorMatched = false;
            } else {
              throw e;
            }
          }
        }

        if (!errorMatched) {
          if (typeof message === "string" || message instanceof RegExp) {
            errorInfo = " with a message matching " + should.format(message) + ", but got '" + err.message + "'";
          } else if ("function" === typeof message) {
            errorInfo = " of type " + functionName(message) + ", but got " + functionName(err.constructor);
          }
        } else if ("function" === typeof message && properties) {
          try {
            should(err).match(properties);
          } catch (e) {
            if (e instanceof should.AssertionError) {
              errorInfo = ": " + e.message;
              errorMatched = false;
            } else {
              throw e;
            }
          }
        }

        that.params.operator += errorInfo;

        that.assert(errorMatched);

        return err;
      }
    );
  };

  /**
   * Assert given object is promise and wrap it in PromisedAssertion, which has all properties of Assertion.
   * That means you can chain as with usual Assertion.
   * Result of assertion is still .thenable and should be handled accordingly.
   *
   * @name finally
   * @memberOf Assertion
   * @alias Assertion#eventually
   * @category assertion promises
   * @returns {PromisedAssertion} Like Assertion, but .then this.obj in Assertion
   * @example
   *
   * (new Promise(function(resolve, reject) { resolve(10); }))
   *    .should.be.eventually.equal(10);
   *
   * // test example with mocha it is possible to return promise
   * it('is async', () => {
   *    return new Promise(resolve => resolve(10))
   *      .should.be.finally.equal(10);
   * });
   */
  Object.defineProperty(Assertion$$1.prototype, "finally", {
    get: function() {
      should(this.obj).be.a.Promise();

      var that = this;

      return new PromisedAssertion(
        this.obj.then(function(obj) {
          var a = should(obj);

          a.negate = that.negate;
          a.anyOne = that.anyOne;

          return a;
        })
      );
    }
  });

  Assertion$$1.alias("finally", "eventually");
}

/*
 * should.js - assertion library
 * Copyright(c) 2010-2013 TJ Holowaychuk <tj@vision-media.ca>
 * Copyright(c) 2013-2017 Denis Bardadym <bardadymchik@gmail.com>
 * MIT Licensed
 */

function stringAssertions(should, Assertion) {
  /**
   * Assert given string starts with prefix
   * @name startWith
   * @memberOf Assertion
   * @category assertion strings
   * @param {string} str Prefix
   * @param {string} [description] Optional message
   * @example
   *
   * 'abc'.should.startWith('a');
   */
  Assertion.add("startWith", function(str, description) {
    this.params = {
      operator: "to start with " + should.format(str),
      message: description
    };

    this.assert(0 === this.obj.indexOf(str));
  });

  /**
   * Assert given string ends with prefix
   * @name endWith
   * @memberOf Assertion
   * @category assertion strings
   * @param {string} str Prefix
   * @param {string} [description] Optional message
   * @example
   *
   * 'abca'.should.endWith('a');
   */
  Assertion.add("endWith", function(str, description) {
    this.params = {
      operator: "to end with " + should.format(str),
      message: description
    };

    this.assert(this.obj.indexOf(str, this.obj.length - str.length) >= 0);
  });
}

/*
 * should.js - assertion library
 * Copyright(c) 2010-2013 TJ Holowaychuk <tj@vision-media.ca>
 * Copyright(c) 2013-2017 Denis Bardadym <bardadymchik@gmail.com>
 * MIT Licensed
 */

function containAssertions(should, Assertion) {
  var i = should.format;

  /**
   * Assert that given object contain something that equal to `other`. It uses `should-equal` for equality checks.
   * If given object is array it search that one of elements was equal to `other`.
   * If given object is string it checks if `other` is a substring - expected that `other` is a string.
   * If given object is Object it checks that `other` is a subobject - expected that `other` is a object.
   *
   * @name containEql
   * @memberOf Assertion
   * @category assertion contain
   * @param {*} other Nested object
   * @example
   *
   * [1, 2, 3].should.containEql(1);
   * [{ a: 1 }, 'a', 10].should.containEql({ a: 1 });
   *
   * 'abc'.should.containEql('b');
   * 'ab1c'.should.containEql(1);
   *
   * ({ a: 10, c: { d: 10 }}).should.containEql({ a: 10 });
   * ({ a: 10, c: { d: 10 }}).should.containEql({ c: { d: 10 }});
   * ({ a: 10, c: { d: 10 }}).should.containEql({ b: 10 });
   * // throws AssertionError: expected { a: 10, c: { d: 10 } } to contain { b: 10 }
   * //            expected { a: 10, c: { d: 10 } } to have property b
   */
  Assertion.add("containEql", function(other) {
    this.params = { operator: "to contain " + i(other) };

    this.is.not.null().and.not.undefined();

    var obj = this.obj;

    if (typeof obj == "string") {
      this.assert(obj.indexOf(String(other)) >= 0);
    } else if (shouldTypeAdaptors.isIterable(obj)) {
      this.assert(
        shouldTypeAdaptors.some(obj, function(v) {
          return eql(v, other).length === 0;
        })
      );
    } else {
      shouldTypeAdaptors.forEach(
        other,
        function(value, key) {
          should(obj).have.value(key, value);
        },
        this
      );
    }
  });

  /**
   * Assert that given object is contain equally structured object on the same depth level.
   * If given object is an array and `other` is an array it checks that the eql elements is going in the same sequence in given array (recursive)
   * If given object is an object it checks that the same keys contain deep equal values (recursive)
   * On other cases it try to check with `.eql`
   *
   * @name containDeepOrdered
   * @memberOf Assertion
   * @category assertion contain
   * @param {*} other Nested object
   * @example
   *
   * [ 1, 2, 3].should.containDeepOrdered([1, 2]);
   * [ 1, 2, [ 1, 2, 3 ]].should.containDeepOrdered([ 1, [ 2, 3 ]]);
   *
   * ({ a: 10, b: { c: 10, d: [1, 2, 3] }}).should.containDeepOrdered({a: 10});
   * ({ a: 10, b: { c: 10, d: [1, 2, 3] }}).should.containDeepOrdered({b: {c: 10}});
   * ({ a: 10, b: { c: 10, d: [1, 2, 3] }}).should.containDeepOrdered({b: {d: [1, 3]}});
   */
  Assertion.add("containDeepOrdered", function(other) {
    this.params = { operator: "to contain " + i(other) };

    var obj = this.obj;
    if (typeof obj == "string") {
      // expect other to be string
      this.is.equal(String(other));
    } else if (shouldTypeAdaptors.isIterable(obj) && shouldTypeAdaptors.isIterable(other)) {
      var objIterator = shouldTypeAdaptors.iterator(obj);
      var otherIterator = shouldTypeAdaptors.iterator(other);

      var nextObj = objIterator.next();
      var nextOther = otherIterator.next();
      while (!nextObj.done && !nextOther.done) {
        try {
          should(nextObj.value[1]).containDeepOrdered(nextOther.value[1]);
          nextOther = otherIterator.next();
        } catch (e) {
          if (!(e instanceof should.AssertionError)) {
            throw e;
          }
        }
        nextObj = objIterator.next();
      }

      this.assert(nextOther.done);
    } else if (obj != null && typeof obj == "object" && other != null && typeof other == "object") {
      //TODO compare types object contains object case
      shouldTypeAdaptors.forEach(other, function(value, key) {
        should(obj[key]).containDeepOrdered(value);
      });

      // if both objects is empty means we finish traversing - and we need to compare for hidden values
      if (shouldTypeAdaptors.isEmpty(other)) {
        this.eql(other);
      }
    } else {
      this.eql(other);
    }
  });

  /**
   * The same like `Assertion#containDeepOrdered` but all checks on arrays without order.
   *
   * @name containDeep
   * @memberOf Assertion
   * @category assertion contain
   * @param {*} other Nested object
   * @example
   *
   * [ 1, 2, 3].should.containDeep([2, 1]);
   * [ 1, 2, [ 1, 2, 3 ]].should.containDeep([ 1, [ 3, 1 ]]);
   */
  Assertion.add("containDeep", function(other) {
    this.params = { operator: "to contain " + i(other) };

    var obj = this.obj;
    if (typeof obj === "string" && typeof other === "string") {
      // expect other to be string
      this.is.equal(String(other));
    } else if (shouldTypeAdaptors.isIterable(obj) && shouldTypeAdaptors.isIterable(other)) {
      var usedKeys = {};
      shouldTypeAdaptors.forEach(
        other,
        function(otherItem) {
          this.assert(
            shouldTypeAdaptors.some(obj, function(item, index) {
              if (index in usedKeys) {
                return false;
              }

              try {
                should(item).containDeep(otherItem);
                usedKeys[index] = true;
                return true;
              } catch (e) {
                if (e instanceof should.AssertionError) {
                  return false;
                }
                throw e;
              }
            })
          );
        },
        this
      );
    } else if (obj != null && other != null && typeof obj == "object" && typeof other == "object") {
      // object contains object case
      shouldTypeAdaptors.forEach(other, function(value, key) {
        should(obj[key]).containDeep(value);
      });

      // if both objects is empty means we finish traversing - and we need to compare for hidden values
      if (shouldTypeAdaptors.isEmpty(other)) {
        this.eql(other);
      }
    } else {
      this.eql(other);
    }
  });
}

/*
 * should.js - assertion library
 * Copyright(c) 2010-2013 TJ Holowaychuk <tj@vision-media.ca>
 * Copyright(c) 2013-2017 Denis Bardadym <bardadymchik@gmail.com>
 * MIT Licensed
 */

var aSlice = Array.prototype.slice;

function propertyAssertions(should, Assertion) {
  var i = should.format;
  /**
   * Asserts given object has some descriptor. **On success it change given object to be value of property**.
   *
   * @name propertyWithDescriptor
   * @memberOf Assertion
   * @category assertion property
   * @param {string} name Name of property
   * @param {Object} desc Descriptor like used in Object.defineProperty (not required to add all properties)
   * @example
   *
   * ({ a: 10 }).should.have.propertyWithDescriptor('a', { enumerable: true });
   */
  Assertion.add("propertyWithDescriptor", function(name, desc) {
    this.params = {
      actual: this.obj,
      operator: "to have own property with descriptor " + i(desc)
    };
    var obj = this.obj;
    this.have.ownProperty(name);
    should(Object.getOwnPropertyDescriptor(Object(obj), name)).have.properties(desc);
  });

  /**
   * Asserts given object has property with optionally value. **On success it change given object to be value of property**.
   *
   * @name property
   * @memberOf Assertion
   * @category assertion property
   * @param {string} name Name of property
   * @param {*} [val] Optional property value to check
   * @example
   *
   * ({ a: 10 }).should.have.property('a');
   */
  Assertion.add("property", function(name, val) {
    name = convertPropertyName(name);
    if (arguments.length > 1) {
      var p = {};
      p[name] = val;
      this.have.properties(p);
    } else {
      this.have.properties(name);
    }
    this.obj = this.obj[name];
  });

  /**
   * Asserts given object has properties. On this method affect .any modifier, which allow to check not all properties.
   *
   * @name properties
   * @memberOf Assertion
   * @category assertion property
   * @param {Array|...string|Object} names Names of property
   * @example
   *
   * ({ a: 10 }).should.have.properties('a');
   * ({ a: 10, b: 20 }).should.have.properties([ 'a' ]);
   * ({ a: 10, b: 20 }).should.have.properties({ b: 20 });
   */
  Assertion.add("properties", function(names) {
    var values = {};
    if (arguments.length > 1) {
      names = aSlice.call(arguments);
    } else if (!Array.isArray(names)) {
      if (typeof names == "string" || typeof names == "symbol") {
        names = [names];
      } else {
        values = names;
        names = Object.keys(names);
      }
    }

    var obj = Object(this.obj),
      missingProperties = [];

    //just enumerate properties and check if they all present
    names.forEach(function(name) {
      if (!(name in obj)) {
        missingProperties.push(formatProp(name));
      }
    });

    var props = missingProperties;
    if (props.length === 0) {
      props = names.map(formatProp);
    } else if (this.anyOne) {
      props = names
        .filter(function(name) {
          return missingProperties.indexOf(formatProp(name)) < 0;
        })
        .map(formatProp);
    }

    var operator =
      (props.length === 1
        ? "to have property "
        : "to have " + (this.anyOne ? "any of " : "") + "properties ") + props.join(", ");

    this.params = { obj: this.obj, operator: operator };

    //check that all properties presented
    //or if we request one of them that at least one them presented
    this.assert(
      missingProperties.length === 0 || (this.anyOne && missingProperties.length != names.length)
    );

    // check if values in object matched expected
    var valueCheckNames = Object.keys(values);
    if (valueCheckNames.length) {
      var wrongValues = [];
      props = [];

      // now check values, as there we have all properties
      valueCheckNames.forEach(function(name) {
        var value = values[name];
        if (eql(obj[name], value).length !== 0) {
          wrongValues.push(formatProp(name) + " of " + i(value) + " (got " + i(obj[name]) + ")");
        } else {
          props.push(formatProp(name) + " of " + i(value));
        }
      });

      if ((wrongValues.length !== 0 && !this.anyOne) || (this.anyOne && props.length === 0)) {
        props = wrongValues;
      }

      operator =
        (props.length === 1
          ? "to have property "
          : "to have " + (this.anyOne ? "any of " : "") + "properties ") + props.join(", ");

      this.params = { obj: this.obj, operator: operator };

      //if there is no not matched values
      //or there is at least one matched
      this.assert(
        wrongValues.length === 0 || (this.anyOne && wrongValues.length != valueCheckNames.length)
      );
    }
  });

  /**
   * Asserts given object has property `length` with given value `n`
   *
   * @name length
   * @alias Assertion#lengthOf
   * @memberOf Assertion
   * @category assertion property
   * @param {number} n Expected length
   * @param {string} [description] Optional message
   * @example
   *
   * [1, 2].should.have.length(2);
   */
  Assertion.add("length", function(n, description) {
    this.have.property("length", n, description);
  });

  Assertion.alias("length", "lengthOf");

  /**
   * Asserts given object has own property. **On success it change given object to be value of property**.
   *
   * @name ownProperty
   * @alias Assertion#hasOwnProperty
   * @memberOf Assertion
   * @category assertion property
   * @param {string} name Name of property
   * @param {string} [description] Optional message
   * @example
   *
   * ({ a: 10 }).should.have.ownProperty('a');
   */
  Assertion.add("ownProperty", function(name, description) {
    name = convertPropertyName(name);
    this.params = {
      actual: this.obj,
      operator: "to have own property " + formatProp(name),
      message: description
    };

    this.assert(shouldUtil.hasOwnProperty(this.obj, name));

    this.obj = this.obj[name];
  });

  Assertion.alias("ownProperty", "hasOwnProperty");

  /**
   * Asserts given object is empty. For strings, arrays and arguments it checks .length property, for objects it checks keys.
   *
   * @name empty
   * @memberOf Assertion
   * @category assertion property
   * @example
   *
   * ''.should.be.empty();
   * [].should.be.empty();
   * ({}).should.be.empty();
   */
  Assertion.add(
    "empty",
    function() {
      this.params = { operator: "to be empty" };
      this.assert(shouldTypeAdaptors.isEmpty(this.obj));
    },
    true
  );

  /**
   * Asserts given object has such keys. Compared to `properties`, `keys` does not accept Object as a argument.
   * When calling via .key current object in assertion changed to value of this key
   *
   * @name keys
   * @alias Assertion#key
   * @memberOf Assertion
   * @category assertion property
   * @param {...*} keys Keys to check
   * @example
   *
   * ({ a: 10 }).should.have.keys('a');
   * ({ a: 10, b: 20 }).should.have.keys('a', 'b');
   * (new Map([[1, 2]])).should.have.key(1);
   *
   * json.should.have.only.keys('type', 'version')
   */
  Assertion.add("keys", function(keys) {
    keys = aSlice.call(arguments);

    var obj = Object(this.obj);

    // first check if some keys are missing
    var missingKeys = keys.filter(function(key) {
      return !shouldTypeAdaptors.has(obj, key);
    });

    var verb = "to have " + (this.onlyThis ? "only " : "") + (keys.length === 1 ? "key " : "keys ");

    this.params = { operator: verb + keys.join(", ") };

    if (missingKeys.length > 0) {
      this.params.operator += "\n\tmissing keys: " + missingKeys.join(", ");
    }

    this.assert(missingKeys.length === 0);

    if (this.onlyThis) {
      should(obj).have.size(keys.length);
    }
  });

  Assertion.add("key", function(key) {
    this.have.keys(key);
    this.obj = shouldTypeAdaptors.get(this.obj, key);
  });

  /**
   * Asserts given object has such value for given key
   *
   * @name value
   * @memberOf Assertion
   * @category assertion property
   * @param {*} key Key to check
   * @param {*} value Value to check
   * @example
   *
   * ({ a: 10 }).should.have.value('a', 10);
   * (new Map([[1, 2]])).should.have.value(1, 2);
   */
  Assertion.add("value", function(key, value) {
    this.have.key(key).which.is.eql(value);
  });

  /**
   * Asserts given object has such size.
   *
   * @name size
   * @memberOf Assertion
   * @category assertion property
   * @param {number} s Size to check
   * @example
   *
   * ({ a: 10 }).should.have.size(1);
   * (new Map([[1, 2]])).should.have.size(1);
   */
  Assertion.add("size", function(s) {
    this.params = { operator: "to have size " + s };
    should(shouldTypeAdaptors.size(this.obj)).be.exactly(s);
  });

  /**
   * Asserts given object has nested property in depth by path. **On success it change given object to be value of final property**.
   *
   * @name propertyByPath
   * @memberOf Assertion
   * @category assertion property
   * @param {Array|...string} properties Properties path to search
   * @example
   *
   * ({ a: {b: 10}}).should.have.propertyByPath('a', 'b').eql(10);
   */
  Assertion.add("propertyByPath", function(properties) {
    properties = aSlice.call(arguments);

    var allProps = properties.map(formatProp);

    properties = properties.map(convertPropertyName);

    var obj = should(Object(this.obj));

    var foundProperties = [];

    var currentProperty;
    while (properties.length) {
      currentProperty = properties.shift();
      this.params = {
        operator:
          "to have property by path " +
          allProps.join(", ") +
          " - failed on " +
          formatProp(currentProperty)
      };
      obj = obj.have.property(currentProperty);
      foundProperties.push(currentProperty);
    }

    this.params = {
      obj: this.obj,
      operator: "to have property by path " + allProps.join(", ")
    };

    this.obj = obj.obj;
  });
}

/*
 * should.js - assertion library
 * Copyright(c) 2010-2013 TJ Holowaychuk <tj@vision-media.ca>
 * Copyright(c) 2013-2017 Denis Bardadym <bardadymchik@gmail.com>
 * MIT Licensed
 */
function errorAssertions(should, Assertion) {
  var i = should.format;

  /**
   * Assert given function throws error with such message.
   *
   * @name throw
   * @memberOf Assertion
   * @category assertion errors
   * @alias Assertion#throwError
   * @param {string|RegExp|Function|Object|GeneratorFunction|GeneratorObject} [message] Message to match or properties
   * @param {Object} [properties] Optional properties that will be matched to thrown error
   * @example
   *
   * (function(){ throw new Error('fail') }).should.throw();
   * (function(){ throw new Error('fail') }).should.throw('fail');
   * (function(){ throw new Error('fail') }).should.throw(/fail/);
   *
   * (function(){ throw new Error('fail') }).should.throw(Error);
   * var error = new Error();
   * error.a = 10;
   * (function(){ throw error; }).should.throw(Error, { a: 10 });
   * (function(){ throw error; }).should.throw({ a: 10 });
   * (function*() {
   *   yield throwError();
   * }).should.throw();
   */
  Assertion.add("throw", function(message, properties) {
    var fn = this.obj;
    var err = {};
    var errorInfo = "";
    var thrown = false;

    if (shouldUtil.isGeneratorFunction(fn)) {
      return should(fn()).throw(message, properties);
    } else if (shouldUtil.isIterator(fn)) {
      return should(fn.next.bind(fn)).throw(message, properties);
    }

    this.is.a.Function();

    var errorMatched = true;

    try {
      fn();
    } catch (e) {
      thrown = true;
      err = e;
    }

    if (thrown) {
      if (message) {
        if ("string" == typeof message) {
          errorMatched = message == err.message;
        } else if (message instanceof RegExp) {
          errorMatched = message.test(err.message);
        } else if ("function" == typeof message) {
          errorMatched = err instanceof message;
        } else if (null != message) {
          try {
            should(err).match(message);
          } catch (e) {
            if (e instanceof should.AssertionError) {
              errorInfo = ": " + e.message;
              errorMatched = false;
            } else {
              throw e;
            }
          }
        }

        if (!errorMatched) {
          if ("string" == typeof message || message instanceof RegExp) {
            errorInfo =
              " with a message matching " +
              i(message) +
              ", but got '" +
              err.message +
              "'";
          } else if ("function" == typeof message) {
            errorInfo =
              " of type " +
              functionName(message) +
              ", but got " +
              functionName(err.constructor);
          }
        } else if ("function" == typeof message && properties) {
          try {
            should(err).match(properties);
          } catch (e) {
            if (e instanceof should.AssertionError) {
              errorInfo = ": " + e.message;
              errorMatched = false;
            } else {
              throw e;
            }
          }
        }
      } else {
        errorInfo = " (got " + i(err) + ")";
      }
    }

    this.params = { operator: "to throw exception" + errorInfo };

    this.assert(thrown);
    this.assert(errorMatched);
  });

  Assertion.alias("throw", "throwError");
}

/*
 * should.js - assertion library
 * Copyright(c) 2010-2013 TJ Holowaychuk <tj@vision-media.ca>
 * Copyright(c) 2013-2017 Denis Bardadym <bardadymchik@gmail.com>
 * MIT Licensed
 */

function matchingAssertions(should, Assertion) {
  var i = should.format;

  /**
   * Asserts if given object match `other` object, using some assumptions:
   * First object matched if they are equal,
   * If `other` is a regexp and given object is a string check on matching with regexp
   * If `other` is a regexp and given object is an array check if all elements matched regexp
   * If `other` is a regexp and given object is an object check values on matching regexp
   * If `other` is a function check if this function throws AssertionError on given object or return false - it will be assumed as not matched
   * If `other` is an object check if the same keys matched with above rules
   * All other cases failed.
   *
   * Usually it is right idea to add pre type assertions, like `.String()` or `.Object()` to be sure assertions will do what you are expecting.
   * Object iteration happen by keys (properties with enumerable: true), thus some objects can cause small pain. Typical example is js
   * Error - it by default has 2 properties `name` and `message`, but they both non-enumerable. In this case make sure you specify checking props (see examples).
   *
   * @name match
   * @memberOf Assertion
   * @category assertion matching
   * @param {*} other Object to match
   * @param {string} [description] Optional message
   * @example
   * 'foobar'.should.match(/^foo/);
   * 'foobar'.should.not.match(/^bar/);
   *
   * ({ a: 'foo', c: 'barfoo' }).should.match(/foo$/);
   *
   * ['a', 'b', 'c'].should.match(/[a-z]/);
   *
   * (5).should.not.match(function(n) {
   *   return n < 0;
   * });
   * (5).should.not.match(function(it) {
   *    it.should.be.an.Array();
   * });
   * ({ a: 10, b: 'abc', c: { d: 10 }, d: 0 }).should
   * .match({ a: 10, b: /c$/, c: function(it) {
   *    return it.should.have.property('d', 10);
   * }});
   *
   * [10, 'abc', { d: 10 }, 0].should
   * .match({ '0': 10, '1': /c$/, '2': function(it) {
   *    return it.should.have.property('d', 10);
   * }});
   *
   * var myString = 'abc';
   *
   * myString.should.be.a.String().and.match(/abc/);
   *
   * myString = {};
   *
   * myString.should.match(/abc/); //yes this will pass
   * //better to do
   * myString.should.be.an.Object().and.not.empty().and.match(/abc/);//fixed
   *
   * (new Error('boom')).should.match(/abc/);//passed because no keys
   * (new Error('boom')).should.not.match({ message: /abc/ });//check specified property
   */
  Assertion.add("match", function(other, description) {
    this.params = { operator: "to match " + i(other), message: description };

    if (eql(this.obj, other).length !== 0) {
      if (other instanceof RegExp) {
        // something - regex

        if (typeof this.obj == "string") {
          this.assert(other.exec(this.obj));
        } else if (null != this.obj && typeof this.obj == "object") {
          var notMatchedProps = [],
            matchedProps = [];
          shouldTypeAdaptors.forEach(
            this.obj,
            function(value, name) {
              if (other.exec(value)) {
                matchedProps.push(formatProp(name));
              } else {
                notMatchedProps.push(formatProp(name) + " (" + i(value) + ")");
              }
            },
            this
          );

          if (notMatchedProps.length) {
            this.params.operator += "\n    not matched properties: " + notMatchedProps.join(", ");
          }
          if (matchedProps.length) {
            this.params.operator += "\n    matched properties: " + matchedProps.join(", ");
          }

          this.assert(notMatchedProps.length === 0);
        } else {
          // should we try to convert to String and exec?
          this.assert(false);
        }
      } else if (typeof other == "function") {
        var res;

        res = other(this.obj);

        //if we throw exception ok - it is used .should inside
        if (typeof res == "boolean") {
          this.assert(res); // if it is just boolean function assert on it
        }
      } else if (typeof this.obj == "object" && this.obj != null && (isPlainObject(other) || Array.isArray(other))) {
        // try to match properties (for Object and Array)
        notMatchedProps = [];
        matchedProps = [];

        shouldTypeAdaptors.forEach(
          other,
          function(value, key) {
            try {
              should(this.obj)
                .have.property(key)
                .which.match(value);
              matchedProps.push(formatProp(key));
            } catch (e) {
              if (e instanceof should.AssertionError) {
                notMatchedProps.push(formatProp(key) + " (" + i(this.obj[key]) + ")");
              } else {
                throw e;
              }
            }
          },
          this
        );

        if (notMatchedProps.length) {
          this.params.operator += "\n    not matched properties: " + notMatchedProps.join(", ");
        }
        if (matchedProps.length) {
          this.params.operator += "\n    matched properties: " + matchedProps.join(", ");
        }

        this.assert(notMatchedProps.length === 0);
      } else {
        this.assert(false);
      }
    }
  });

  /**
   * Asserts if given object values or array elements all match `other` object, using some assumptions:
   * First object matched if they are equal,
   * If `other` is a regexp - matching with regexp
   * If `other` is a function check if this function throws AssertionError on given object or return false - it will be assumed as not matched
   * All other cases check if this `other` equal to each element
   *
   * @name matchEach
   * @memberOf Assertion
   * @category assertion matching
   * @alias Assertion#matchEvery
   * @param {*} other Object to match
   * @param {string} [description] Optional message
   * @example
   * [ 'a', 'b', 'c'].should.matchEach(/\w+/);
   * [ 'a', 'a', 'a'].should.matchEach('a');
   *
   * [ 'a', 'a', 'a'].should.matchEach(function(value) { value.should.be.eql('a') });
   *
   * { a: 'a', b: 'a', c: 'a' }.should.matchEach(function(value) { value.should.be.eql('a') });
   */
  Assertion.add("matchEach", function(other, description) {
    this.params = {
      operator: "to match each " + i(other),
      message: description
    };

    shouldTypeAdaptors.forEach(
      this.obj,
      function(value) {
        should(value).match(other);
      },
      this
    );
  });

  /**
  * Asserts if any of given object values or array elements match `other` object, using some assumptions:
  * First object matched if they are equal,
  * If `other` is a regexp - matching with regexp
  * If `other` is a function check if this function throws AssertionError on given object or return false - it will be assumed as not matched
  * All other cases check if this `other` equal to each element
  *
  * @name matchAny
  * @memberOf Assertion
  * @category assertion matching
  * @param {*} other Object to match
  * @alias Assertion#matchSome
  * @param {string} [description] Optional message
  * @example
  * [ 'a', 'b', 'c'].should.matchAny(/\w+/);
  * [ 'a', 'b', 'c'].should.matchAny('a');
  *
  * [ 'a', 'b', 'c'].should.matchAny(function(value) { value.should.be.eql('a') });
  *
  * { a: 'a', b: 'b', c: 'c' }.should.matchAny(function(value) { value.should.be.eql('a') });
  */
  Assertion.add("matchAny", function(other, description) {
    this.params = {
      operator: "to match any " + i(other),
      message: description
    };

    this.assert(
      shouldTypeAdaptors.some(this.obj, function(value) {
        try {
          should(value).match(other);
          return true;
        } catch (e) {
          if (e instanceof should.AssertionError) {
            // Caught an AssertionError, return false to the iterator
            return false;
          }
          throw e;
        }
      })
    );
  });

  Assertion.alias("matchAny", "matchSome");
  Assertion.alias("matchEach", "matchEvery");
}

/*
 * should.js - assertion library
 * Copyright(c) 2010-2013 TJ Holowaychuk <tj@vision-media.ca>
 * Copyright(c) 2013-2017 Denis Bardadym <bardadymchik@gmail.com>
 * MIT Licensed
 */
/**
 * Our function should
 *
 * @param {*} obj Object to assert
 * @returns {should.Assertion} Returns new Assertion for beginning assertion chain
 * @example
 *
 * var should = require('should');
 * should('abc').be.a.String();
 */
function should$1(obj) {
  return new Assertion(obj);
}

should$1.AssertionError = AssertionError;
should$1.Assertion = Assertion;

// exposing modules dirty way
should$1.modules = {
  format: sformat,
  type: getType,
  equal: eql
};
should$1.format = format;

/**
 * Object with configuration.
 * It contains such properties:
 * * `checkProtoEql` boolean - Affect if `.eql` will check objects prototypes
 * * `plusZeroAndMinusZeroEqual` boolean - Affect if `.eql` will treat +0 and -0 as equal
 * Also it can contain options for should-format.
 *
 * @type {Object}
 * @memberOf should
 * @static
 * @example
 *
 * var a = { a: 10 }, b = Object.create(null);
 * b.a = 10;
 *
 * a.should.be.eql(b);
 * //not throws
 *
 * should.config.checkProtoEql = true;
 * a.should.be.eql(b);
 * //throws AssertionError: expected { a: 10 } to equal { a: 10 } (because A and B have different prototypes)
 */
should$1.config = config;

/**
 * Allow to extend given prototype with should property using given name. This getter will **unwrap** all standard wrappers like `Number`, `Boolean`, `String`.
 * Using `should(obj)` is the equivalent of using `obj.should` with known issues (like nulls and method calls etc).
 *
 * To add new assertions, need to use Assertion.add method.
 *
 * @param {string} [propertyName] Name of property to add. Default is `'should'`.
 * @param {Object} [proto] Prototype to extend with. Default is `Object.prototype`.
 * @memberOf should
 * @returns {{ name: string, descriptor: Object, proto: Object }} Descriptor enough to return all back
 * @static
 * @example
 *
 * var prev = should.extend('must', Object.prototype);
 *
 * 'abc'.must.startWith('a');
 *
 * var should = should.noConflict(prev);
 * should.not.exist(Object.prototype.must);
 */
should$1.extend = function(propertyName, proto) {
  propertyName = propertyName || "should";
  proto = proto || Object.prototype;

  var prevDescriptor = Object.getOwnPropertyDescriptor(proto, propertyName);

  Object.defineProperty(proto, propertyName, {
    set: function() {},
    get: function() {
      return should$1(isWrapperType(this) ? this.valueOf() : this);
    },
    configurable: true
  });

  return { name: propertyName, descriptor: prevDescriptor, proto: proto };
};

/**
 * Delete previous extension. If `desc` missing it will remove default extension.
 *
 * @param {{ name: string, descriptor: Object, proto: Object }} [desc] Returned from `should.extend` object
 * @memberOf should
 * @returns {Function} Returns should function
 * @static
 * @example
 *
 * var should = require('should').noConflict();
 *
 * should(Object.prototype).not.have.property('should');
 *
 * var prev = should.extend('must', Object.prototype);
 * 'abc'.must.startWith('a');
 * should.noConflict(prev);
 *
 * should(Object.prototype).not.have.property('must');
 */
should$1.noConflict = function(desc) {
  desc = desc || should$1._prevShould;

  if (desc) {
    delete desc.proto[desc.name];

    if (desc.descriptor) {
      Object.defineProperty(desc.proto, desc.name, desc.descriptor);
    }
  }
  return should$1;
};

/**
 * Simple utility function for a bit more easier should assertion extension
 * @param {Function} f So called plugin function. It should accept 2 arguments: `should` function and `Assertion` constructor
 * @memberOf should
 * @returns {Function} Returns `should` function
 * @static
 * @example
 *
 * should.use(function(should, Assertion) {
 *   Assertion.add('asset', function() {
 *      this.params = { operator: 'to be asset' };
 *
 *      this.obj.should.have.property('id').which.is.a.Number();
 *      this.obj.should.have.property('path');
 *  })
 * })
 */
should$1.use = function(f) {
  f(should$1, should$1.Assertion);
  return this;
};

should$1
  .use(assertExtensions)
  .use(chainAssertions)
  .use(booleanAssertions)
  .use(numberAssertions)
  .use(equalityAssertions)
  .use(typeAssertions)
  .use(stringAssertions)
  .use(propertyAssertions)
  .use(errorAssertions)
  .use(matchingAssertions)
  .use(containAssertions)
  .use(promiseAssertions);

var defaultProto = Object.prototype;
var defaultProperty = "should";

var freeGlobal =
  typeof global == "object" && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf =
  typeof self == "object" && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function("return this")();

//Expose api via `Object#should`.
try {
  var prevShould = should$1.extend(defaultProperty, defaultProto);
  should$1._prevShould = prevShould;

  Object.defineProperty(root, "should", {
    enumerable: false,
    configurable: true,
    value: should$1
  });
} catch (e) {
  //ignore errors
}

module.exports = should$1;

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"should-equal":7,"should-format":8,"should-type":10,"should-type-adaptors":9,"should-util":11}],13:[function(require,module,exports){
function CommerceHandler(common) {
  this.common = common || {};
}

CommerceHandler.prototype.logCommerceEvent = function(event) {
  /*
      Sample ecommerce event schema:
      {
          CurrencyCode: 'USD',
          DeviceId:'a80eea1c-57f5-4f84-815e-06fe971b6ef2', // MP generated
          EventAttributes: { key1: 'value1', key2: 'value2' },
          EventType: 16,
          EventCategory: 10, // (This is an add product to cart event, see below for additional ecommerce EventCategories)
          EventName: "eCommerce - AddToCart",
          MPID: "8278431810143183490",
          ProductAction: {
              Affiliation: 'aff1',
              CouponCode: 'coupon',
              ProductActionType: 7,
              ProductList: [
                  {
                      Attributes: { prodKey1: 'prodValue1', prodKey2: 'prodValue2' },
                      Brand: 'Apple',
                      Category: 'phones',
                      CouponCode: 'coupon1',
                      Name: 'iPhone',
                      Price: '600',
                      Quantity: 2,
                      Sku: "SKU123",
                      TotalAmount: 1200,
                      Variant: '64GB'
                  }
              ],
              TransactionId: "tid1",
              ShippingAmount: 10,
              TaxAmount: 5,
              TotalAmount: 1215,
          },
          UserAttributes: { userKey1: 'userValue1', userKey2: 'userValue2' }
          UserIdentities: [
              {
                  Identity: 'test@gmail.com', Type: 7
              }
          ]
      }
      If your SDK has specific ways to log different eCommerce events, see below for
      mParticle's additional ecommerce EventCategory types:
          10: ProductAddToCart, (as shown above)
          11: ProductRemoveFromCart,
          12: ProductCheckout,
          13: ProductCheckoutOption,
          14: ProductClick,
          15: ProductViewDetail,
          16: ProductPurchase,
          17: ProductRefund,
          18: PromotionView,
          19: PromotionClick,
          20: ProductAddToWishlist,
          21: ProductRemoveFromWishlist,
          22: ProductImpression
      */
};

module.exports = CommerceHandler;

},{}],14:[function(require,module,exports){
function Common() {}

Common.prototype.exampleMethod = function () {
    return 'I am an example';
}

module.exports = Common;

},{}],15:[function(require,module,exports){
/*
A non-ecommerce event has the following schema:
{
    DeviceId: "a80eea1c-57f5-4f84-815e-06fe971b6ef2",
    EventAttributes: {test: "Error", t: 'stack trace in string form'},
    EventName: "Error",
    MPID: "123123123123",
    UserAttributes: {userAttr1: 'value1', userAttr2: 'value2'},
    UserIdentities: [{Identity: 'email@gmail.com', Type: 7}]
    User Identity Types can be found here:
}
*/

function EventHandler(common) {
  this.common = common || {};
}
EventHandler.prototype.logEvent = function(event) {};
EventHandler.prototype.logError = function(event) {
  // The schema for a logError event is the same, but noteworthy differences are as follows:
  // {
  //     EventAttributes: {m: 'name of error passed into MP', s: "Error", t: 'stack trace in string form if applicable'},
  //     EventName: "Error"
  // }
};
EventHandler.prototype.logPageView = function(event) {
  /* The schema for a logPagView event is the same, but noteworthy differences are as follows:
      {
          EventAttributes: {hostname: "www.google.com", title: 'Test Page'},  // These are event attributes only if no additional event attributes are explicitly provided to mParticle.logPageView(...)
      }
      */
};

module.exports = EventHandler;

},{}],16:[function(require,module,exports){
/*
The 'mParticleUser' is an object with methods get user Identities and set/get user attributes
Partners can determine what userIds are available to use in their SDK
Call mParticleUser.getUserIdentities() to return an object of userIdentities --> { userIdentities: {customerid: '1234', email: 'email@gmail.com'} }
For more identity types, see http://docs.mparticle.com/developers/sdk/javascript/identity#allowed-identity-types
Call mParticleUser.getMPID() to get mParticle ID
For any additional methods, see http://docs.mparticle.com/developers/sdk/javascript/apidocs/classes/mParticle.Identity.getCurrentUser().html
*/

/*
identityApiRequest has the schema:
{
  userIdentities: {
    customerid: '123',
    email: 'abc'
  }
}
For more userIdentity types, see http://docs.mparticle.com/developers/sdk/javascript/identity#allowed-identity-types
*/
var Initialization = require('./initialization');

function IdentityHandler(common) {
  this.common = common || {};
}
IdentityHandler.prototype.onUserIdentified = function(mParticleUser) {
  Initialization.generateConsentEvent();
};
IdentityHandler.prototype.onIdentifyComplete = function(
  mParticleUser,
  identityApiRequest
) {};
IdentityHandler.prototype.onLoginComplete = function(
  mParticleUser,
  identityApiRequest
) {};
IdentityHandler.prototype.onLogoutComplete = function(
  mParticleUser,
  identityApiRequest
) {};
IdentityHandler.prototype.onModifyComplete = function(
  mParticleUser,
  identityApiRequest
) {};

/*  In previous versions of the mParticle web SDK, setting user identities on
  kits is only reachable via the onSetUserIdentity method below. We recommend
  filling out `onSetUserIdentity` for maximum compatibility
*/
IdentityHandler.prototype.onSetUserIdentity = function(
  forwarderSettings,
  id,
  type
) {};

module.exports = IdentityHandler;

},{"./initialization":17}],17:[function(require,module,exports){
var initialization = {
    name: 'Didomi',
    moduleId: 168,
    purposesMapping: {},
    initForwarder: function(forwarderSettings) {
        this.purposesMapping = this.parsePurposesMapping(
            forwarderSettings.purposes
        );

        var self = this;
        window.didomiEventListeners = window.didomiEventListeners || [];
        window.didomiEventListeners.push({
            event: 'consent.changed',
            listener: function (context) {
                self.generateConsentEvent();
            }
        });
    },
    generateConsentEvent: function() {
        var location = window.location.href;
        var didomiUser = Didomi.getUserStatus();
        var mParticleUser = mParticle.Identity.getCurrentUser();
        var consentState = null;

        if (mParticleUser) {
            consentState = mParticleUser.getConsentState();
            if (!consentState) {
                consentState = mParticle.Consent.createConsentState();
            }
            for (var didomiPurpose in this.purposesMapping) {
                var mParticlePurpose = this.purposesMapping[didomiPurpose];

                var purposeConsentSatus = this.getPurposeStatusFromDidomiUser(didomiUser, didomiPurpose);
                var mParticleConsentForPurpose = mParticle.Consent.createGDPRConsent(purposeConsentSatus, Date.now(), mParticlePurpose, location);
                consentState.addGDPRConsentState(mParticlePurpose, mParticleConsentForPurpose);
            }

            mParticleUser.setConsentState(consentState);
        }
    },
    getPurposeStatusFromDidomiUser: function (didomiUser, purposeName) {
        var enabledConsentPurposes = didomiUser.purposes.consent.enabled;
        var enabledLIPurposes = didomiUser.purposes.legitimate_interest.enabled;
        var enabledPurposes = [...enabledConsentPurposes, ...enabledLIPurposes];

        return enabledPurposes.indexOf(purposeName) > -1;
    },
    parsePurposesMapping: function(rawPurposesMapping) {
        var purposesMap = {};
        var parsedPurposesMapping = JSON.parse(rawPurposesMapping.replace(/&quot;/g, '\"')) || [];

        for (var purposeMap of parsedPurposesMapping) {
            purposesMap[purposeMap.value] = purposeMap.map;
        }

        return purposesMap;
    },
};

module.exports = initialization;

},{}],18:[function(require,module,exports){
var sessionHandler = {
  onSessionStart: function(event) {
      
  },
  onSessionEnd: function(event) {

  }
};

module.exports = sessionHandler;

},{}],19:[function(require,module,exports){
/*
The 'mParticleUser' is an object with methods on it to get user Identities and set/get user attributes
Partners can determine what userIds are available to use in their SDK
Call mParticleUser.getUserIdentities() to return an object of userIdentities --> { userIdentities: {customerid: '1234', email: 'email@gmail.com'} }
For more identity types, see http://docs.mparticle.com/developers/sdk/javascript/identity#allowed-identity-types
Call mParticleUser.getMPID() to get mParticle ID
For any additional methods, see http://docs.mparticle.com/developers/sdk/javascript/apidocs/classes/mParticle.Identity.getCurrentUser().html
*/

function UserAttributeHandler(common) {
  this.common = common || {};
}
UserAttributeHandler.prototype.onRemoveUserAttribute = function(
  key,
  mParticleUser
) {};
UserAttributeHandler.prototype.onSetUserAttribute = function(
  key,
  value,
  mParticleUser
) {};
UserAttributeHandler.prototype.onConsentStateUpdated = function(
  oldState,
  newState,
  mParticleUser
) {};

module.exports = UserAttributeHandler;

},{}],20:[function(require,module,exports){
require('../mockhttprequest.js');
window.Should = require('should');
require('@mparticle/web-sdk');

require('../didomi.sdk');
require('../../dist/Didomi-Kit.common.js');

mParticle.addForwarder = function (forwarder) {
    mParticle.forwarder = new forwarder.constructor();
};
require('../../node_modules/@mparticle/web-kit-wrapper/index.js');
require('../tests.js');

},{"../../dist/Didomi-Kit.common.js":1,"../../node_modules/@mparticle/web-kit-wrapper/index.js":2,"../didomi.sdk":21,"../mockhttprequest.js":24,"../tests.js":25,"@mparticle/web-sdk":3,"should":12}],21:[function(require,module,exports){
/*! For license information please see sdk.js.LICENSE.txt */
window.Didomi=function(e){function t(t){for(var n,i,o=t[0],s=t[1],a=0,u=[];a<o.length;a++)i=o[a],Object.prototype.hasOwnProperty.call(r,i)&&r[i]&&u.push(r[i][0]),r[i]=0;for(n in s)Object.prototype.hasOwnProperty.call(s,n)&&(e[n]=s[n]);for(c&&c(t);u.length;)u.shift()()}var n={},r={main:0};function i(t){if(n[t])return n[t].exports;var r=n[t]={i:t,l:!1,exports:{}};return e[t].call(r.exports,r,r.exports,i),r.l=!0,r.exports}i.e=function(e){var t=[],n=r[e];if(0!==n)if(n)t.push(n[2]);else{var o=new Promise((function(t,i){n=r[e]=[t,i]}));t.push(n[2]=o);var s,a=document.createElement("script");a.charset="utf-8",a.timeout=120,i.nc&&a.setAttribute("nonce",i.nc),a.src=function(e){return i.p+""+({components:"components","iab-texts":"iab-texts",polyfills:"polyfills","tcf-service-v1":"tcf-service-v1","ui-ccpa":"ui-ccpa","ui-ccpa-en":"ui-ccpa-en","ui-gdpr-ar":"ui-gdpr-ar","ui-gdpr-ar-tcf-v2":"ui-gdpr-ar-tcf-v2","ui-gdpr-az-AZ":"ui-gdpr-az-AZ","ui-gdpr-az-AZ-tcf-v2":"ui-gdpr-az-AZ-tcf-v2","ui-gdpr-bg":"ui-gdpr-bg","ui-gdpr-bg-tcf-v2":"ui-gdpr-bg-tcf-v2","ui-gdpr-bn-IN":"ui-gdpr-bn-IN","ui-gdpr-bn-IN-tcf-v2":"ui-gdpr-bn-IN-tcf-v2","ui-gdpr-ca":"ui-gdpr-ca","ui-gdpr-ca-tcf-v2":"ui-gdpr-ca-tcf-v2","ui-gdpr-cs":"ui-gdpr-cs","ui-gdpr-cs-tcf-v2":"ui-gdpr-cs-tcf-v2","ui-gdpr-da":"ui-gdpr-da","ui-gdpr-da-tcf-v2":"ui-gdpr-da-tcf-v2","ui-gdpr-de":"ui-gdpr-de","ui-gdpr-de-tcf-v2":"ui-gdpr-de-tcf-v2","ui-gdpr-el":"ui-gdpr-el","ui-gdpr-el-tcf-v2":"ui-gdpr-el-tcf-v2","ui-gdpr-en":"ui-gdpr-en","ui-gdpr-en-tcf-v2":"ui-gdpr-en-tcf-v2","ui-gdpr-es":"ui-gdpr-es","ui-gdpr-es-tcf-v2":"ui-gdpr-es-tcf-v2","ui-gdpr-et":"ui-gdpr-et","ui-gdpr-et-tcf-v2":"ui-gdpr-et-tcf-v2","ui-gdpr-fi":"ui-gdpr-fi","ui-gdpr-fi-tcf-v2":"ui-gdpr-fi-tcf-v2","ui-gdpr-fil":"ui-gdpr-fil","ui-gdpr-fil-tcf-v2":"ui-gdpr-fil-tcf-v2","ui-gdpr-fr":"ui-gdpr-fr","ui-gdpr-fr-tcf-v2":"ui-gdpr-fr-tcf-v2","ui-gdpr-he":"ui-gdpr-he","ui-gdpr-he-tcf-v2":"ui-gdpr-he-tcf-v2","ui-gdpr-hi-IN":"ui-gdpr-hi-IN","ui-gdpr-hi-IN-tcf-v2":"ui-gdpr-hi-IN-tcf-v2","ui-gdpr-hr":"ui-gdpr-hr","ui-gdpr-hr-tcf-v2":"ui-gdpr-hr-tcf-v2","ui-gdpr-hu":"ui-gdpr-hu","ui-gdpr-hu-tcf-v2":"ui-gdpr-hu-tcf-v2","ui-gdpr-id":"ui-gdpr-id","ui-gdpr-id-tcf-v2":"ui-gdpr-id-tcf-v2","ui-gdpr-it":"ui-gdpr-it","ui-gdpr-it-tcf-v2":"ui-gdpr-it-tcf-v2","ui-gdpr-ja":"ui-gdpr-ja","ui-gdpr-ja-tcf-v2":"ui-gdpr-ja-tcf-v2","ui-gdpr-ko":"ui-gdpr-ko","ui-gdpr-ko-tcf-v2":"ui-gdpr-ko-tcf-v2","ui-gdpr-lt":"ui-gdpr-lt","ui-gdpr-lt-tcf-v2":"ui-gdpr-lt-tcf-v2","ui-gdpr-lv":"ui-gdpr-lv","ui-gdpr-lv-tcf-v2":"ui-gdpr-lv-tcf-v2","ui-gdpr-mk-MK":"ui-gdpr-mk-MK","ui-gdpr-mk-MK-tcf-v2":"ui-gdpr-mk-MK-tcf-v2","ui-gdpr-ms":"ui-gdpr-ms","ui-gdpr-ms-tcf-v2":"ui-gdpr-ms-tcf-v2","ui-gdpr-nl":"ui-gdpr-nl","ui-gdpr-nl-tcf-v2":"ui-gdpr-nl-tcf-v2","ui-gdpr-no":"ui-gdpr-no","ui-gdpr-no-tcf-v2":"ui-gdpr-no-tcf-v2","ui-gdpr-pl":"ui-gdpr-pl","ui-gdpr-pl-tcf-v2":"ui-gdpr-pl-tcf-v2","ui-gdpr-pt":"ui-gdpr-pt","ui-gdpr-pt-BR":"ui-gdpr-pt-BR","ui-gdpr-pt-BR-tcf-v2":"ui-gdpr-pt-BR-tcf-v2","ui-gdpr-pt-tcf-v2":"ui-gdpr-pt-tcf-v2","ui-gdpr-ro":"ui-gdpr-ro","ui-gdpr-ro-tcf-v2":"ui-gdpr-ro-tcf-v2","ui-gdpr-ru":"ui-gdpr-ru","ui-gdpr-ru-tcf-v2":"ui-gdpr-ru-tcf-v2","ui-gdpr-sk":"ui-gdpr-sk","ui-gdpr-sk-tcf-v2":"ui-gdpr-sk-tcf-v2","ui-gdpr-sl":"ui-gdpr-sl","ui-gdpr-sl-tcf-v2":"ui-gdpr-sl-tcf-v2","ui-gdpr-sr":"ui-gdpr-sr","ui-gdpr-sr-tcf-v2":"ui-gdpr-sr-tcf-v2","ui-gdpr-sv":"ui-gdpr-sv","ui-gdpr-sv-tcf-v2":"ui-gdpr-sv-tcf-v2","ui-gdpr-sw":"ui-gdpr-sw","ui-gdpr-sw-tcf-v2":"ui-gdpr-sw-tcf-v2","ui-gdpr-th":"ui-gdpr-th","ui-gdpr-th-tcf-v2":"ui-gdpr-th-tcf-v2","ui-gdpr-tr":"ui-gdpr-tr","ui-gdpr-tr-tcf-v2":"ui-gdpr-tr-tcf-v2","ui-gdpr-uk":"ui-gdpr-uk","ui-gdpr-uk-tcf-v2":"ui-gdpr-uk-tcf-v2","ui-gdpr-vi":"ui-gdpr-vi","ui-gdpr-vi-tcf-v2":"ui-gdpr-vi-tcf-v2","ui-gdpr-zh-CN":"ui-gdpr-zh-CN","ui-gdpr-zh-CN-tcf-v2":"ui-gdpr-zh-CN-tcf-v2","ui-gdpr-zh-TW":"ui-gdpr-zh-TW","ui-gdpr-zh-TW-tcf-v2":"ui-gdpr-zh-TW-tcf-v2","components-ui":"components-ui","spatial-navigation":"spatial-navigation"}[e]||e)+".166d8bd5d06f8cfc9dc3559ef2bc012dbfd5134a.js"}(e);var c=new Error;s=function(t){a.onerror=a.onload=null,clearTimeout(u);var n=r[e];if(0!==n){if(n){var i=t&&("load"===t.type?"missing":t.type),o=t&&t.target&&t.target.src;c.message="Loading chunk "+e+" failed.\n("+i+": "+o+")",c.name="ChunkLoadError",c.type=i,c.request=o,n[1](c)}r[e]=void 0}};var u=setTimeout((function(){s({type:"timeout",target:a})}),12e4);a.onerror=a.onload=s,document.head.appendChild(a)}return Promise.all(t)},i.m=e,i.c=n,i.d=function(e,t,n){i.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},i.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.t=function(e,t){if(1&t&&(e=i(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)i.d(n,r,function(t){return e[t]}.bind(null,r));return n},i.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return i.d(t,"a",t),t},i.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},i.p="https://sdk.privacy-center.org/",i.oe=function(e){throw console.error(e),e};var o=window.webpackJsonpDidomi=window.webpackJsonpDidomi||[],s=o.push.bind(o);o.push=t,o=o.slice();for(var a=0;a<o.length;a++)t(o[a]);var c=s;return i(i.s=92)}([function(e,t,n){"use strict";n.d(t,"d",(function(){return l})),n.d(t,"b",(function(){return f})),n.d(t,"e",(function(){return d})),n.d(t,"c",(function(){return v})),n.d(t,"h",(function(){return h})),n.d(t,"a",(function(){return g})),n.d(t,"l",(function(){return a})),n.d(t,"f",(function(){return u.a})),n.d(t,"m",(function(){return b})),n.d(t,"k",(function(){return y})),n.d(t,"i",(function(){return m})),n.d(t,"j",(function(){return S})),n.d(t,"g",(function(){return O}));n(18);var r=n(11),i=n.n(r),o=n(89),s=n.n(o),a=function(e,t,n){t.split&&(t=t.split("."));for(var r,i,o=0,s=t.length,a=e;o<s;)"__proto__"!==(i=t[o++])&&"constructor"!==i&&"prototype"!==i&&(a=a[i]=o===s?n:null!=(r=a[i])?r:0*t[o]!=0||~t[o].indexOf(".")?{}:[])},c=n(58),u=n.n(c);function p(e){return"object"===i()(e)&&null!==e&&e.constructor===Object}function l(e,t){for(var n in t)t.hasOwnProperty(n)&&(n in e&&p(e[n])&&p(t[n])?l(e[n],t[n]):e[n]=t[n]);return e}function f(e){return e="object"===i()(e)?e:{},JSON.parse(JSON.stringify(e))}function d(e,t){return l(f(e),t)}function v(e,t){return s()(e,t)}function h(e){return e&&e.constructor===Object&&0===Object.keys(e).length}function g(e,t){if(!Array.isArray(e)||!Array.isArray(t))return!1;if(e.length!==t.length)return!1;for(var n=0;n<e.length;n++){var r=e[n];if(-1===t.indexOf(r))return!1}for(var i=0;i<t.length;i++){var o=t[i];if(-1===e.indexOf(o))return!1}return!0}function b(e){return"function"==typeof Object.values?Object.values(e):Object.keys(e).map((function(t){return e[t]}))}function y(e,t){return t.reduce((function(t,n){return e.hasOwnProperty(n)&&(t[n]=e[n]),t}),{})}function m(e){return!isNaN(e)&&("number"==typeof e||e instanceof Number)}function S(e){return"string"==typeof e||e instanceof String}function O(e){return Array.isArray(e)?e:[]}},function(e,t,n){var r=n(98),i=n(99),o=n(60),s=n(100);e.exports=function(e){return r(e)||i(e)||o(e)||s()},e.exports.__esModule=!0,e.exports.default=e.exports},function(e,t){function n(t){return e.exports=n=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)},e.exports.__esModule=!0,e.exports.default=e.exports,n(t)}e.exports=n,e.exports.__esModule=!0,e.exports.default=e.exports},function(e,t){e.exports=function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")},e.exports.__esModule=!0,e.exports.default=e.exports},function(e,t){function n(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}e.exports=function(e,t,r){return t&&n(e.prototype,t),r&&n(e,r),Object.defineProperty(e,"prototype",{writable:!1}),e},e.exports.__esModule=!0,e.exports.default=e.exports},function(e,t){e.exports=function(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e},e.exports.__esModule=!0,e.exports.default=e.exports},function(e,t,n){var r=n(101);e.exports=function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),Object.defineProperty(e,"prototype",{writable:!1}),t&&r(e,t)},e.exports.__esModule=!0,e.exports.default=e.exports},function(e,t,n){var r=n(11).default,i=n(50);e.exports=function(e,t){if(t&&("object"===r(t)||"function"==typeof t))return t;if(void 0!==t)throw new TypeError("Derived constructors may only return object or undefined");return i(e)},e.exports.__esModule=!0,e.exports.default=e.exports},function(e,t,n){"use strict";n.d(t,"d",(function(){return v})),n.d(t,"f",(function(){return h})),n.d(t,"c",(function(){return g})),n.d(t,"j",(function(){return b})),n.d(t,"e",(function(){return y})),n.d(t,"b",(function(){return m})),n.d(t,"a",(function(){return S})),n.d(t,"p",(function(){return O})),n.d(t,"o",(function(){return C})),n.d(t,"m",(function(){return w})),n.d(t,"n",(function(){return P})),n.d(t,"k",(function(){return k})),n.d(t,"l",(function(){return j})),n.d(t,"h",(function(){return _})),n.d(t,"i",(function(){return I})),n.d(t,"g",(function(){return A}));var r,i,o,s,a,c=n(1),u=n.n(c),p=n(5),l=n.n(p),f=n(61),d=n(0),v={Cookies:"cookies",CookiesAnalytics:"cookies_analytics",CookiesMarketing:"cookies_marketing",CookiesSocial:"cookies_social",AdvertisingPersonalization:"advertising_personalization",Analytics:"analytics",ContentPersonalization:"content_personalization",AdDelivery:"ad_delivery",DeviceAccess:"device_access",OfflineMatch:"offline_match",LinkDevices:"link_devices",PreciseGeo:"precise_geo",SelectBasicAds:"select_basic_ads",CreateAdsProfile:"create_ads_profile",SelectPersonalizedAds:"select_personalized_ads",CreateContentProfile:"create_content_profile",SelectPersonalizedContent:"select_personalized_content",MeasureAdPerformance:"measure_ad_performance",MeasureContentPerformance:"measure_content_performance",MarketResearch:"market_research",ImproveProducts:"improve_products"},h={1:(r={},l()(r,v.Cookies,1),l()(r,v.CookiesAnalytics,1),l()(r,v.CookiesMarketing,1),l()(r,v.CookiesSocial,1),l()(r,v.DeviceAccess,1),l()(r,v.AdvertisingPersonalization,2),l()(r,v.AdDelivery,3),l()(r,v.ContentPersonalization,4),l()(r,v.Analytics,5),r),2:(i={},l()(i,v.Cookies,1),l()(i,v.CookiesAnalytics,1),l()(i,v.CookiesMarketing,1),l()(i,v.CookiesSocial,1),l()(i,v.SelectBasicAds,2),l()(i,v.CreateAdsProfile,3),l()(i,v.SelectPersonalizedAds,4),l()(i,v.CreateContentProfile,5),l()(i,v.SelectPersonalizedContent,6),l()(i,v.MeasureAdPerformance,7),l()(i,v.MeasureContentPerformance,8),l()(i,v.MarketResearch,9),l()(i,v.ImproveProducts,10),i)},g={1:(o={},l()(o,v.Cookies,1),l()(o,v.AdvertisingPersonalization,2),l()(o,v.AdDelivery,3),l()(o,v.ContentPersonalization,4),l()(o,v.Analytics,5),o),2:(s={},l()(s,v.Cookies,1),l()(s,v.SelectBasicAds,2),l()(s,v.CreateAdsProfile,3),l()(s,v.SelectPersonalizedAds,4),l()(s,v.CreateContentProfile,5),l()(s,v.SelectPersonalizedContent,6),l()(s,v.MeasureAdPerformance,7),l()(s,v.MeasureContentPerformance,8),l()(s,v.MarketResearch,9),l()(s,v.ImproveProducts,10),s)};function b(e,t){for(var n=0,r=Object.keys(h[t]);n<r.length;n++){var i=r[n];if(String(e)===String(h[t][i]))return i}return null}var y={GeolocationData:"geolocation_data",DeviceCharacteristics:"device_characteristics"},m=(a={},l()(a,y.GeolocationData,1),l()(a,y.DeviceCharacteristics,2),a),S=Object.keys(m);[].concat(u()(Object.keys(g[2])),u()(S));function O(e){return"iab"===e.namespace||!!e.namespaces&&(!!e.namespaces.iab||!!e.namespaces.iab2)}function C(e){return!!Object(d.f)(e,"namespaces.google.current")}function w(e){if("iab"===e.namespace){var t="number"==typeof e.id?e.id:parseInt(e.id,10);if(t)return t}else if(e.namespaces){if("number"==typeof e.namespaces.iab)return e.namespaces.iab;if("number"==typeof e.namespaces.iab2)return e.namespaces.iab2}return null}function P(e){for(var t=[],n=0;n<e.length;n++){var r=w(e[n]);r&&t.push(r)}return t}function k(e){for(var t=0;t<S.length;t++){var n=S[t];if(String(e)===String(m[n]))return n}return null}function j(e,t){if(1===t||2===t)return Object(d.f)(h,[t,e])}function _(e,t,n,r,i){for(var o={},s={},a=0,c=n.purposes;a<c.length;a++){var u=c[a].id;o[u]=!1;var p=b(u,i);p&&(o[u]=-1!==e.indexOf(p))}for(var l=0;l<r.length;l++){var f=r[l],d=w(f);d&&(s[d]=-1!==t.indexOf(f.id)||-1!==t.indexOf(d))}return{iabPurposesStatus:o,iabVendorsStatus:s}}function I(e,t,n,r,i,o,s){var a=arguments.length>7&&void 0!==arguments[7]?arguments[7]:7,c=_(e,t,o,s,1),u=c.iabPurposesStatus,p=c.iabVendorsStatus,l=new f.ConsentString;return l.created=n,l.lastUpdated=r,l.setCmpId(a),l.setCmpVersion(1),l.setConsentScreen(1),l.setConsentLanguage(i),l.setPurposesAllowed(Object.keys(u).filter((function(e){return!0===u[e]})).map((function(e){return Number(e)}))),l.setVendorsAllowed(Object.keys(p).filter((function(e){return!0===p[e]})).map((function(e){return Number(e)}))),l.setGlobalVendorList(o),{consentData:l,iabPurposesStatus:u,iabVendorsStatus:p}}var A={google:755,salesforce:506}},function(e,t,n){"use strict";n.d(t,"f",(function(){return v})),n.d(t,"k",(function(){return h})),n.d(t,"j",(function(){return g})),n.d(t,"i",(function(){return b})),n.d(t,"g",(function(){return y})),n.d(t,"w",(function(){return m})),n.d(t,"x",(function(){return S})),n.d(t,"v",(function(){return O})),n.d(t,"q",(function(){return w})),n.d(t,"s",(function(){return j})),n.d(t,"r",(function(){return _})),n.d(t,"u",(function(){return I})),n.d(t,"n",(function(){return A})),n.d(t,"t",(function(){return E})),n.d(t,"a",(function(){return L})),n.d(t,"m",(function(){return D})),n.d(t,"b",(function(){return x})),n.d(t,"d",(function(){return R})),n.d(t,"c",(function(){return V})),n.d(t,"e",(function(){return B})),n.d(t,"h",(function(){return F})),n.d(t,"z",(function(){return U})),n.d(t,"y",(function(){return M})),n.d(t,"l",(function(){return N})),n.d(t,"p",(function(){return z})),n.d(t,"o",(function(){return G}));var r=n(1),i=n.n(r),o=n(5),s=n.n(o),a=n(11),c=n.n(a),u=n(10),p=n(13),l=n(15);function f(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function d(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?f(Object(n),!0).forEach((function(t){s()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):f(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var v=function(e){return e.website.enabledTCFAPIErrorLogging},h=function(e){return e.website.google.additionalConsent.positive},g=function(e){return e.website.google.additionalConsent.negative},b=function(e){return e.website.google.fullATP},y=function(e){return e.website.essentialPurposes},m=function(e){return e.website.vendors},S=Object(u.a)(m,p.f,(function(e,t){return e.map((function(e){return t[e]})).filter((function(e){return"object"===c()(e)}))})),O=Object(u.a)(S,(function(e){return e.filter((function(e){return e.legIntPurposeIds.length>0})).map((function(e){return e.id}))})),C=function(e){return e.website.purposes},w=Object(u.a)(C,y,(function(e,t){return e.filter((function(e){return-1===t.indexOf(e)}))})),P=function(e){return e.website.disabledPurposes||[]},k=Object(u.a)(S,P,(function(e,t){for(var n=[],r=0;r<e.length;r++){var i=e[r];if(Array.isArray(i.purposeIds))for(var o=0,s=i.purposeIds;o<s.length;o++){var a=s[o];-1===n.indexOf(a)&&-1===t.indexOf(a)&&n.push(a)}}return n})),j=Object(u.a)(S,P,(function(e,t){for(var n=[],r=0;r<e.length;r++){var i=e[r];if(Array.isArray(i.legIntPurposeIds))for(var o=0,s=i.legIntPurposeIds;o<s.length;o++){var a=s[o];-1===n.indexOf(a)&&-1===t.indexOf(a)&&n.push(a)}}return n})),_=Object(u.a)(k,p.e,(function(e,t){return e.map((function(e){return d(d({},t[e]),{},{legalBasis:"consent"})})).filter((function(e){return e.id}))})),I=Object(u.a)(j,p.e,(function(e,t){return e.map((function(e){return d(d({},t[e]),{},{legalBasis:"legitimate_interest"})})).filter((function(e){return e.id}))})),A=Object(u.a)(C,k,j,p.e,(function(e,t,n,r){var o=[].concat(i()(t),i()(n));return e.filter((function(e){return-1===o.indexOf(e)})).map((function(e){return d(d({},r[e]),{},{legalBasis:"consent"})})).filter((function(e){return e.id}))})),T=Object(u.a)(A,P,(function(e,t){return e.map((function(e){return-1===t.indexOf(e.id)?e.id:null})).filter((function(e){return null!=e}))})),E=Object(u.a)(j,y,(function(e,t){return e.filter((function(e){return-1===t.indexOf(e)}))})),L=Object(u.a)(j,k,T,y,(function(e,t,n){var r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:[];return Object(l.a)([].concat(i()(e),i()(t),i()(n),i()(r)))})),D=function(e){return e.website.publisherCountryCode},x=function(e){return e.website.consentDuration},R=function(e){return e.website.deniedConsentDuration},V=Object(u.a)(x,(function(e){return e/86400})),B=function(e){return e.website.deploymentId},F=Object(u.a)((function(e){var t;return null===(t=e.website)||void 0===t?void 0:t.customDomain}),(function(e){var t,n,r;return null===(t=e.events)||void 0===t||null===(n=t.template)||void 0===n||null===(r=n.source)||void 0===r?void 0:r.domain}),(function(e,t){return e||t||location.host||"com.app.generic"})),U=Object(u.a)([p.b,y],(function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[],n=[],r=[],o=[];return e.forEach((function(e){var s=e.id,a=e.purposeIds,c=e.legIntPurposeIds,u=a.length>0&&a.every((function(e){return-1!==t.indexOf(e)})),p=c.length>0&&c.every((function(e){return-1!==t.indexOf(e)})),l=[].concat(i()(a),i()(c)),f=l.length>0&&l.every((function(e){return-1!==t.indexOf(e)}));u&&n.push(s),p&&r.push(s),f&&o.push(s)})),{vendorIdsWithOnlyEssentialConsentPurposes:n,vendorIdsWithOnlyEssentialLegIntPurposes:r,vendorIdsWithOnlyEssentialPurposes:o}})),M=function(e){var t;return null===(t=e.website)||void 0===t?void 0:t.version},N=Object(u.a)(M,(function(e){return void 0!==e})),z=function(e){var t,n;return null===(t=e.website)||void 0===t||null===(n=t.regulation)||void 0===n?void 0:n.name},G=function(e){var t,n,r;return null===(t=e.website)||void 0===t||null===(n=t.regulation)||void 0===n||null===(r=n.group)||void 0===r?void 0:r.name}},function(e,t,n){"use strict";function r(e,t){return e===t}function i(e,t,n){if(null===t||null===n||t.length!==n.length)return!1;for(var r=t.length,i=0;i<r;i++)if(!e(t[i],n[i]))return!1;return!0}function o(e){var t=Array.isArray(e[0])?e[0]:e;if(!t.every((function(e){return"function"==typeof e}))){var n=t.map((function(e){return typeof e})).join(", ");throw new Error("Selector creators expect all input-selectors to be functions, instead received the following types: ["+n+"]")}return t}n.d(t,"a",(function(){return s}));var s=function(e){for(var t=arguments.length,n=Array(t>1?t-1:0),r=1;r<t;r++)n[r-1]=arguments[r];return function(){for(var t=arguments.length,r=Array(t),i=0;i<t;i++)r[i]=arguments[i];var s=0,a=r.pop(),c=o(r),u=e.apply(void 0,[function(){return s++,a.apply(null,arguments)}].concat(n)),p=e((function(){for(var e=[],t=c.length,n=0;n<t;n++)e.push(c[n].apply(null,arguments));return u.apply(null,e)}));return p.resultFunc=a,p.dependencies=c,p.recomputations=function(){return s},p.resetRecomputations=function(){return s=0},p}}((function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:r,n=null,o=null;return function(){return i(t,n,arguments)||(o=e.apply(null,arguments)),n=arguments,o}}))},function(e,t){function n(t){return e.exports=n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},e.exports.__esModule=!0,e.exports.default=e.exports,n(t)}e.exports=n,e.exports.__esModule=!0,e.exports.default=e.exports},function(e,t,n){"use strict";n.d(t,"a",(function(){return a}));var r=n(4),i=n.n(r),o=n(3),s=n.n(o),a=i()((function e(t,n,r){s()(this,e),this.store=t,this.actions=n,this.services=r||{}}))},function(e,t,n){"use strict";n.d(t,"f",(function(){return p})),n.d(t,"g",(function(){return l})),n.d(t,"b",(function(){return d})),n.d(t,"c",(function(){return g})),n.d(t,"d",(function(){return b})),n.d(t,"a",(function(){return y})),n.d(t,"e",(function(){return m}));var r=n(5),i=n.n(r),o=n(10),s=n(8),a=n(0);function c(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function u(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?c(Object(n),!0).forEach((function(t){i()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):c(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var p=function(e){return e.databases.vendors},l=Object(o.a)(p,(function(e){return Object(a.m)(e)})),f=Object(o.a)(l,(function(e){return e.filter((function(e){return"iab"!==e.namespace}))})),d=Object(o.a)(l,(function(e){return e.filter((function(e){return"custom"===e.namespace}))})),v=Object(o.a)(f,(function(e){return e.filter((function(e){return Object(s.p)(e)}))})),h=Object(o.a)(v,(function(e){return e.map((function(e){return Object(s.m)(e)}))})),g=function(e){return e.databases.iabVendorList},b=Object(o.a)([g,h],(function(e,t){return u(u({},e),{},{vendors:e.vendors.filter((function(e){return-1===t.indexOf(e.id)}))})})),y=Object(o.a)(p,(function(e){return Object(a.m)(e).filter((function(e){return!!e.namespaces&&(-1!==Object.keys(e.namespaces).indexOf("google")&&!!Object(a.f)(e,"namespaces.google.current"))}))})),m=function(e){return e.databases.purposes}},function(e,t,n){"use strict";n.d(t,"b",(function(){return o})),n.d(t,"k",(function(){return s})),n.d(t,"c",(function(){return a})),n.d(t,"g",(function(){return c})),n.d(t,"h",(function(){return u})),n.d(t,"d",(function(){return p})),n.d(t,"j",(function(){return l})),n.d(t,"l",(function(){return f})),n.d(t,"i",(function(){return d})),n.d(t,"f",(function(){return v})),n.d(t,"e",(function(){return h})),n.d(t,"a",(function(){return g}));var r=n(31),i=n.n(r);function o(e){return"string"!=typeof e||0===e.indexOf("javascript:")||/^https?:\/\//i.test(e)||(e="http://".concat(e)),e}function s(e){return e.replace(/^https?:\/\//,"")}function a(){return(new Date).toISOString()}function c(e){return new Date(Date.UTC(e.getUTCFullYear(),e.getUTCMonth(),e.getUTCDate()))}function u(){return"166d8bd5d06f8cfc9dc3559ef2bc012dbfd5134a"}function p(e){var t=Math.round((new Date-e)/864e5);if(t<0)throw new Error("The date ".concat(e," cannot be in the future"));return t}function l(){return/iPad|iPhone|iPod/.test(navigator.userAgent)&&!window.MSStream}function f(e,t,n){if(!e||n<t)return!1;var r=0,i=setInterval((function(){r+=t,e((function(){return clearInterval(i)})),r>=n&&clearInterval(i)}),t);return!0}function d(e){return"string"==typeof e&&-1!==e.indexOf("Didomi.preferences.show('vendors')")}function v(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"",n={},r=document.createElement("a");r.href=e;for(var i=r.search.substring(1),o=i.split("&"),s=0;s<o.length;s++){var a=o[s].split("=");if(a[0]&&-1!==a[0].indexOf(t))try{n[a[0]]=decodeURIComponent(a[1])}catch(e){console.error('Didomi - Invalid JSON from query-string parameter "'.concat(a[0],'": ').concat(e.message))}}return n}function h(e){return decodeURI(window.location.search).replace("?","").split("&").filter(String).map((function(e){return e.split("=")})).reduce((function(e,t){var n=i()(t,2),r=n[0],o=n[1];return e[r]=o,e}),{})[e]}var g=function(e){return function(){try{e.apply(void 0,arguments)}catch(e){console.error("Callback error at TCF API execution",e)}}}},function(e,t,n){"use strict";n.d(t,"a",(function(){return r})),n.d(t,"b",(function(){return i}));var r=function(e){var t=[];return new Set(e).forEach((function(e){return t.push(e)})),t},i=function(e,t){return e.every((function(e){return-1!==t.indexOf(e)}))}},function(e,t,n){"use strict";function r(e){for(var n in e)t.hasOwnProperty(n)||(t[n]=e[n])}Object.defineProperty(t,"__esModule",{value:!0}),r(n(52)),r(n(22)),r(n(23)),r(n(34)),r(n(79)),r(n(80)),r(n(81)),r(n(124))},function(e,t,n){"use strict";n.d(t,"e",(function(){return l})),n.d(t,"g",(function(){return f})),n.d(t,"d",(function(){return d})),n.d(t,"a",(function(){return v})),n.d(t,"i",(function(){return P})),n.d(t,"h",(function(){return k})),n.d(t,"f",(function(){return j})),n.d(t,"c",(function(){return _})),n.d(t,"b",(function(){return I}));var r=n(1),i=n.n(r),o=n(10),s=n(9),a=n(0),c=n(13),u=n(25),p=n(15);function l(e){return Object(a.f)(e,"cookies.didomiTokenCookieName","didomi_token")}function f(e){return Object(a.f)(e,"cookies.iabCookieName","euconsent-v2")}function d(e){return Object(a.f)(e,"consent")}function v(e){return Object(a.f)(e,"iab.consentString")}function h(e){return Object(a.f)(e,"consent.purposes.enabled",[])}function g(e){return Object(a.f)(e,"consent.vendors.enabled",[])}function b(e){return Object(a.f)(e,"consent.purposes_li.enabled",[])}function y(e){return Object(a.f)(e,"consent.vendors_li.enabled",[])}var m=Object(o.a)([h,b,s.a,s.g],(function(e,t,n,r){var o=Object(p.a)([].concat(i()(e),i()(t),i()(Object(a.g)(r)))),s=n.filter((function(e){return-1===o.indexOf(e)}));return{enabled:o,disabled:s}})),S=Object(o.a)([g,function(e){return Object(a.f)(e,"consent.vendors.disabled",[])},function(e){return Object(a.f)(e,"consent.vendors_li.enabled",[])},function(e){return Object(a.f)(e,"consent.vendors_li.disabled",[])},s.w],(function(e,t,n,r,o){return Object(p.a)([].concat(i()(e),i()(t),i()(n),i()(r),i()(o)))})),O=Object(o.a)([h,s.g,g,c.f,S],(function(e,t,n,r,o){var s=n.filter((function(n){return!!r[n]&&Object(p.b)(r[n].purposeIds,[].concat(i()(e),i()(Object(a.g)(t))))})),c=o.filter((function(e){return-1===s.indexOf(e)}));return{enabled:s,disabled:c}})),C=Object(o.a)([b,s.g,y,c.f,S],(function(e,t,n,r,o){var s=n.filter((function(n){return!!r[n]&&Object(p.b)(Object(a.g)(r[n].legIntPurposeIds),[].concat(i()(e),i()(Object(a.g)(t))))})),c=o.filter((function(e){return-1===s.indexOf(e)}));return{enabled:s,disabled:c}})),w=Object(o.a)([h,b,s.g,g,y,c.f,S],(function(e,t,n,r,o,s,c){var u=Object(p.a)([].concat(i()(r),i()(o))).filter((function(r){if(s[r]){var o=[].concat(i()(Object(a.g)(s[r].purposeIds)),i()(Object(a.g)(s[r].legIntPurposeIds))),c=[].concat(i()(e),i()(t),i()(Object(a.g)(n)));return Object(p.b)(o,c)}return!1})),l=c.filter((function(e){return-1===u.indexOf(e)}));return{enabled:u,disabled:l}})),P=Object(o.a)([d,v,u.b,m,s.g,w,O,C],(function(e,t,n,r,i,o,s,c){return{purposes:{consent:{enabled:Object(a.f)(e,"purposes.enabled"),disabled:Object(a.f)(e,"purposes.disabled")},legitimate_interest:{enabled:Object(a.f)(e,"purposes_li.enabled"),disabled:Object(a.f)(e,"purposes_li.disabled")},global:r,essential:i||[]},vendors:{consent:{enabled:Object(a.f)(e,"vendors.enabled"),disabled:Object(a.f)(e,"vendors.disabled")},legitimate_interest:{enabled:Object(a.f)(e,"vendors_li.enabled"),disabled:Object(a.f)(e,"vendors_li.disabled")},global:o,global_consent:s,global_li:c},user_id:e.user_id,created:e.created,updated:e.updated,consent_string:t,addtl_consent:n}})),k=Object(o.a)([c.a,s.x],(function(e,t){if(void 0===t)return[];var n=t.map((function(e){return e.id}));return e.filter((function(e){var t=e.id;return-1!==n.indexOf(t)}))})),j=Object(o.a)([c.a,d],(function(e,t){for(var n=[],r=e.map((function(e){return e.id})),i=t.vendors,o=t.vendors_li,s=function(e){return-1!==r.indexOf(e)},c=i.enabled.filter(s),u=o.enabled.filter(s),p=0;p<e.length;p++){var l=e[p],f=l.purposeIds.length>0,d=l.legIntPurposeIds.length>0;(f||d)&&(f&&-1===c.indexOf(l.id)||d&&-1===u.indexOf(l.id)||n.push(Object(a.f)(l,"namespaces.google.id")))}return n.filter((function(e,t){return n.indexOf(e)==t}))})),_=function(e){return Object(a.f)(e.cookies.thirdPartyCookiesData,"iabConsentString")},I=function(e){return e.cookies.localCookiesData.iabConsentString}},function(e,t){function n(){return e.exports=n=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},e.exports.__esModule=!0,e.exports.default=e.exports,n.apply(this,arguments)}e.exports=n,e.exports.__esModule=!0,e.exports.default=e.exports},function(e,t,n){"use strict";function r(e){var t="; ".concat(document.cookie).split("; ".concat(e,"="));return 2!==t.length?void 0:t.pop().split(";").shift()}n.d(t,"b",(function(){return r})),n.d(t,"c",(function(){return s})),n.d(t,"d",(function(){return a})),n.d(t,"a",(function(){return c}));var i="ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|be|bf|bg|bh|bi|bj|bm|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|cl|cm|cn|co|cr|cu|cv|cw|cx|cz|de|dj|dk|dm|do|dz|ec|ee|eg|es|et|eu|fi|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|im|in|io|iq|ir|is|it|je|jo|jp|kg|ki|km|kn|kp|kr|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|na|nc|ne|nf|ng|nl|no|nr|nu|nz|om|pa|pe|pf|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|yt".split("|"),o="co|com|edu|gov|net|mil|org|nom|sch|caa|res|off|gob|int|tur|ip6|uri|urn|asn|act|nsw|qld|tas|vic|pro|biz|adm|adv|agr|arq|art|ato|bio|bmd|cim|cng|cnt|ecn|eco|emp|eng|esp|etc|eti|far|fnd|fot|fst|g12|ggf|imb|ind|inf|jor|jus|leg|lel|mat|med|mus|not|ntr|odo|ppg|psc|psi|qsl|rec|slg|srv|teo|tmp|trd|vet|zlg|web|ltd|sld|pol|fin|k12|lib|pri|aip|fie|eun|sci|prd|cci|pvt|mod|idv|rel|sex|gen|nic|abr|bas|cal|cam|emr|fvg|laz|lig|lom|mar|mol|pmn|pug|sar|sic|taa|tos|umb|vao|vda|ven|mie|北海道|和歌山|神奈川|鹿児島|ass|rep|tra|per|ngo|soc|grp|plc|its|air|and|bus|can|ddr|jfk|mad|nrw|nyc|ski|spy|tcm|ulm|usa|war|fhs|vgs|dep|eid|fet|fla|flå|gol|hof|hol|sel|vik|cri|iwi|ing|abo|fam|gok|gon|gop|gos|aid|atm|gsm|sos|elk|waw|est|aca|bar|cpa|jur|law|sec|plo|www|bir|cbg|jar|khv|msk|nov|nsk|ptz|rnd|spb|stv|tom|tsk|udm|vrn|cmw|kms|nkz|snz|pub|fhv|red|ens|nat|rns|rnu|bbs|tel|bel|kep|nhs|dni|fed|isa|nsn|gub|e12|tec|орг|обр|упр|alt|nis|jpn|mex|ath|iki|nid|gda|inc".split("|");function s(e){for(var t=(e=e.replace(/^www\./,"")).split(".");t.length>3;)t.shift();return 3===t.length&&(t[1].length>2&&t[2].length>2||-1===o.indexOf(t[1])||t[1].length>3&&-1!==i.indexOf(t[2]))&&t.shift(),t.join(".")}function a(e,t,n,r,i,o,s){var a=new Date;a.setDate(a.getDate()+(n||365));var c=["".concat(e,"=").concat(t),"expires=".concat(a.toUTCString()),"path=".concat(s||"/")];r&&c.push("domain=".concat(r)),i&&c.push("SameSite=".concat(i)),!0===o&&c.push("Secure"),document.cookie=c.join(";")}function c(e,t,n){var r=["".concat(e,"="),"expires=Thu, 01 Jan 1970 00:00:01 GMT","path=".concat(n||"/")];t&&r.push("domain=".concat(t)),document.cookie=r.join(";")}},function(e,t,n){(function(e){var n=["responseType","withCredentials","timeout","onprogress"];function r(e,t,n){e[t]=e[t]||n}t.ajax=function(t,i){var o=t.headers||{},s=t.body,a=t.method||(s?"POST":"GET"),c=!1,u=function(t){if(t&&e.XDomainRequest&&!/MSIE 1/.test(navigator.userAgent))return new XDomainRequest;if(e.XMLHttpRequest)return new XMLHttpRequest}(t.cors);function p(e,t){return function(){c||(i(void 0===u.status?e:u.status,0===u.status?"Error":u.response||u.responseText||t,u),c=!0)}}u.open(a,t.url,!0);var l=u.onload=p(200);u.onreadystatechange=function(){4===u.readyState&&l()},u.onerror=p(null,"Error"),u.ontimeout=p(null,"Timeout"),u.onabort=p(null,"Abort"),s&&(r(o,"X-Requested-With","XMLHttpRequest"),e.FormData&&s instanceof e.FormData||r(o,"Content-Type","application/x-www-form-urlencoded"));for(var f=0,d=n.length;f<d;f++)void 0!==t[v=n[f]]&&(u[v]=t[v]);for(var v in o)u.setRequestHeader(v,o[v]);return u.send(s),u}}).call(this,n(38))},function(e,t,n){"use strict";n.d(t,"b",(function(){return c})),n.d(t,"c",(function(){return u})),n.d(t,"d",(function(){return p})),n.d(t,"e",(function(){return l})),n.d(t,"a",(function(){return f}));var r=n(19),i=n(30),o="/",s=365,a={cookies:!0,localStorage:!0};function c(e){var t,n,o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:a;return o.cookies&&(t=Object(r.b)(e)),o.localStorage&&(n=Object(i.b)(e)),t||n}function u(e,t){var n,o,s,c,u=arguments.length>2&&void 0!==arguments[2]?arguments[2]:a;return u.cookies&&(n=Object(r.b)(e),o=Object(r.b)(t),n&&o)?{didomiToken:n,iabConsentString:o}:u.localStorage&&(s=Object(i.b)(e),c=Object(i.b)(t),s&&c)?{didomiToken:s,iabConsentString:c}:{didomiToken:n||s,iabConsentString:o||c}}function p(e){var t,n,o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:a;return o.cookies&&(t=Object(r.b)(e))?{optoutDidomiToken:t}:o.localStorage&&(n=Object(i.b)(e))?{optoutDidomiToken:n}:{optoutDidomiToken:null}}function l(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null,c=arguments.length>3&&void 0!==arguments[3]?arguments[3]:a,u=arguments.length>4&&void 0!==arguments[4]&&arguments[4],p=arguments.length>5&&void 0!==arguments[5]&&arguments[5],l=arguments.length>6?arguments[6]:void 0;if(c.cookies){var f=null,d=!1;p&&(u?(f="None",d=!0):f="Lax"),Object(r.d)(e,t,void 0===l?s:l,n,f,d,o)}c.localStorage&&Object(i.c)(e,t)}function f(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;Object(r.a)(e,t),Object(i.a)(e)}},function(e,t,n){"use strict";function r(e){for(var n in e)t.hasOwnProperty(n)||(t[n]=e[n])}Object.defineProperty(t,"__esModule",{value:!0}),r(n(110)),r(n(111)),r(n(112)),r(n(113))},function(e,t,n){"use strict";function r(e){for(var n in e)t.hasOwnProperty(n)||(t[n]=e[n])}Object.defineProperty(t,"__esModule",{value:!0}),r(n(68)),r(n(114)),r(n(69)),r(n(70)),r(n(115)),r(n(116)),r(n(54)),r(n(71)),r(n(117)),r(n(118))},function(e,t,n){"use strict";n.d(t,"a",(function(){return Ze})),n.d(t,"c",(function(){return ot})),n.d(t,"b",(function(){return st}));var r={};n.r(r),n.d(r,"initialState",(function(){return k})),n.d(r,"actions",(function(){return j}));var i={};n.r(i),n.d(i,"initialState",(function(){return R})),n.d(i,"getRemoteConfig",(function(){return V})),n.d(i,"getRegulationAdditionalCountries",(function(){return B})),n.d(i,"isGDPREnabled",(function(){return F})),n.d(i,"actions",(function(){return U}));var o={};n.r(o),n.d(o,"initialState",(function(){return z})),n.d(o,"actions",(function(){return G}));var s={};n.r(s),n.d(s,"initialState",(function(){return K})),n.d(s,"actions",(function(){return H}));var a={};n.r(a),n.d(a,"initialState",(function(){return se})),n.d(a,"actions",(function(){return ae}));var c={};n.r(c),n.d(c,"initialState",(function(){return pe})),n.d(c,"actions",(function(){return le}));var u={};n.r(u),n.d(u,"initialState",(function(){return fe})),n.d(u,"actions",(function(){return de}));var p={};n.r(p),n.d(p,"initialState",(function(){return ve})),n.d(p,"actions",(function(){return he}));var l={};n.r(l),n.d(l,"initialState",(function(){return ye})),n.d(l,"actions",(function(){return me}));var f={};n.r(f),n.d(f,"initialState",(function(){return we})),n.d(f,"actions",(function(){return Pe}));var d={};n.r(d),n.d(d,"initialState",(function(){return je})),n.d(d,"actions",(function(){return _e}));var v={};n.r(v),n.d(v,"initialState",(function(){return Ie})),n.d(v,"actions",(function(){return Ae}));var h={};n.r(h),n.d(h,"initialState",(function(){return Ee})),n.d(h,"actions",(function(){return Le}));var g={};n.r(g),n.d(g,"initialState",(function(){return Ve})),n.d(g,"actions",(function(){return Be}));var b={};n.r(b),n.d(b,"initialState",(function(){return Fe})),n.d(b,"actions",(function(){return Ue}));var y={};n.r(y),n.d(y,"initialState",(function(){return ze})),n.d(y,"actions",(function(){return Ge}));var m={};n.r(m),n.d(m,"initialState",(function(){return qe})),n.d(m,"actions",(function(){return We}));var S={};n.r(S),n.d(S,"initialState",(function(){return Je})),n.d(S,"actions",(function(){return Qe}));var O=n(88),C=n.n(O),w=n(56),P=(n(96),n(97),n(0)),k={sdkConfig:{apiPath:"https://api.privacy-center.org/v1",customSDKPath:"https://sdk.privacy-center.org/custom/",iabGlobalCookiesDomain:"didomi.mgr.consensu.org",globalCookiesProtocol:"https",pmpSdkPath:"https://pmp-sdk.privacy-center.org",events:{sampleSizes:{pageview:.03,consentAsked:.1,consentGiven:1,uiActionPreferencesPurposes:1,uiActionPreferencesVendors:1,uiActionPreferencesPurposeChanged:1,uiActionPreferencesVendorChanged:1}},metrics:{monitoringDidomiOnLoadSampleSize:.1}}},j=function(){return{setSDKConfig:function(e,t){return{sdkConfig:Object(P.e)(e.sdkConfig,t)}}}},_=n(5),I=n.n(_),A=n(1),T=n.n(A),E=n(11),L=n.n(E);function D(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function x(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?D(Object(n),!0).forEach((function(t){I()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):D(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var R={user:{country:null,region:null,isBot:!1,authToken:null,organizationId:null,organizationUserId:null,bots:{consentRequired:!0,types:["crawlers","performance"],extraUserAgents:[]},regulations:{ccpa:!1,gdpr:!1},externalConsent:{enabled:!1,value:null},shouldReadTokenFromURL:!1,shouldReadTokenFromLocalStorage:!1,ignoreConsentBefore:null,organizationUserIdAuthAlgorithm:null,organizationUserIdAuthSid:null,organizationUserIdAuthSalt:null,organizationUserIdAuthDigest:null,organizationUserIdExp:null,organizationUserIdIv:null}},V=function(){if(window.didomiRemoteConfig&&"object"===L()(window.didomiRemoteConfig)){var e=Object(P.f)(window.didomiRemoteConfig,"notices.0");if(e&&"object"===L()(e))return e.config}},B=function(e){var t,n,r,i,o,s,a=(null===(t=V())||void 0===t||null===(n=t.regulations)||void 0===n||null===(r=n[e])||void 0===r?void 0:r.additionalCountries)||[],c=(null===(i=window.didomiConfig)||void 0===i||null===(o=i.regulations)||void 0===o||null===(s=o[e])||void 0===s?void 0:s.additionalCountries)||[];return[].concat(T()(a),T()(c))},F=function(e){return Array.isArray(window.didomiGeoRegulations)&&-1!==window.didomiGeoRegulations.indexOf("gdpr")||-1!==B("gdpr").indexOf(e)},U=function(){return{setUserConfig:function(e,t){return x(x({},e),{},{user:Object(P.d)(e.user||{},t)})},setUserLocation:function(e,t,n){return x(x({},e),{},{user:x(x({},e.user),{},{country:t,region:n,regulations:{ccpa:"US"===t&&"CA"===n,gdpr:F(t)}})})},setUserId:function(e,t){return x(x({},e),{},{user:x(x({},e.user),{},{id:t})})}}};function M(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function N(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?M(Object(n),!0).forEach((function(t){I()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):M(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var z={sync:{enabled:!1,delayNotice:!0,timeout:3e3,frequency:86400}},G=function(){return{setSyncConfig:function(e,t){return N(N({},e),{},{sync:Object(P.d)(e.sync,t)})}}};function q(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function W(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?q(Object(n),!0).forEach((function(t){I()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):q(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var K={consentNotice:{enable:!0,show:!1,showOnUILoad:!1,daysBeforeShowingAgain:0,closeOnClick:!1,closeOnClickNavigationDelay:0,closeOnScroll:!1,closeOnScrollThresholdType:"percent",closeOnScrollThreshold:30,closeOnClickBackdrop:!1,type:"info",position:"panel-bottom-right",textAlignment:"left",logoAlignment:"center",learnMore:!0,learnMoreURL:null,learnMorePosition:null,showDataProcessing:!1,palette:{notice:{background:"#ffffff",text:null},button:{background:null,border:"rgba(34, 34, 34, 0.2)",text:null},hightlightButton:{background:null,border:"rgba(34, 34, 34, 0.2)",text:null}},canCloseAndIgnore:!1,denyAsPrimary:!0,denyAsLink:!1,denyAppliesToLI:!1,denyOptions:null,enableBulkActionOnPurposes:!1}},H=function(){return{showConsentNotice:function(e){return{consentNotice:W(W({},e.consentNotice),{},{show:!0})}},showConsentNoticeOnLoad:function(e){return{consentNotice:W(W({},e.consentNotice),{},{showOnUILoad:!0})}},hideConsentNotice:function(e){return{consentNotice:W(W({},e.consentNotice),{},{show:!1,showOnUILoad:!1})}},enableConsentNotice:function(e){return{consentNotice:W(W({},e.consentNotice),{},{enable:!0})}},disableConsentNotice:function(e){return{consentNotice:W(W({},e.consentNotice),{},{enable:!1})}},setConsentNoticeConfig:function(e,t){return{consentNotice:Object(P.e)(e.consentNotice,t)}}}},J=n(18),Q=n.n(J),Y=n(3),Z=n.n(Y),X=n(4),$=n.n(X),ee=/^#[0-9a-f]{3}$/i,te=/^#[0-9a-f]{6}$/i,ne=/^rgb\(\s*([0-9]+),\s*([0-9]+),\s*([0-9]+)\s*\)$/i,re=/^rgba\(\s*([0-9]+),\s*([0-9]+),\s*([0-9]+),\s*([0-9.]+)\s*\)$/i,ie=function(){function e(t){if(Z()(this,e),this.color={},t.match(ee)){var n=e.normalize({r:17*parseInt(t.charAt(1),16),g:17*parseInt(t.charAt(2),16),b:17*parseInt(t.charAt(3),16),a:1});Q()(this,n)}else{if(t.match(te)){var r=e.normalize({r:parseInt(t.slice(1,3),16),g:parseInt(t.slice(3,5),16),b:parseInt(t.slice(5,7),16),a:1});Q()(this,r)}else{var i=t.match(ne);if(i){var o=e.normalize({r:parseInt(i[1],10),g:parseInt(i[2],10),b:parseInt(i[3],10),a:1});Q()(this,o)}else{var s=t.match(re);if(!s)throw new TypeError("Didomi SDK - ".concat(t," is not a valid CSS color string"));var a=e.normalize({r:parseInt(s[1],10),g:parseInt(s[2],10),b:parseInt(s[3],10),a:parseFloat(s[4])});Q()(this,a)}}}}return $()(e,[{key:"alpha",value:function(){return this.a}},{key:"blue",value:function(){return Math.round(this.b)}},{key:"clone",value:function(){return new e(this.toRGBAString())}},{key:"green",value:function(){return Math.round(this.g)}},{key:"isDark",value:function(){return(299*this.red()+587*this.green()+144*this.blue())/1e3<133}},{key:"isLight",value:function(){return!this.isDark()}},{key:"red",value:function(){return Math.round(this.r)}},{key:"setAlpha",value:function(e){return this.a=e,this}},{key:"toRGBAString",value:function(){return"rgba(".concat(this.red(),",").concat(this.green(),",").concat(this.blue(),",").concat(this.alpha(),")")}},{key:"toString",value:function(){return this.toRGBAString()}}],[{key:"clamp",value:function(e,t,n){return e=void 0===e?0:e,t=void 0!==t?t:0,n=void 0!==n?n:1,Math.max(t,Math.min(n,e))}},{key:"normalize",value:function(t){return t.r=e.clamp(t.r,0,255),t.g=e.clamp(t.g,0,255),t.b=e.clamp(t.b,0,255),t.a=e.clamp(t.a,0,1),t}}]),e}();function oe(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=new ie(e.color||e.accentColor||e.primaryColor||"#05687B"),n=e.linkColor||t.toRGBAString(),r=e.font||"Arial",i=Object(P.e)({regularButtons:{borderRadius:"0px",backgroundColor:"#eeeeee",textColor:"#444444",borderColor:"rgba(34, 34, 34, 0.2)",borderWidth:"1px"},highlightButtons:{borderRadius:"0px",backgroundColor:t.toRGBAString(),textColor:t.isLight()?"#000000":"#ffffff",borderColor:t.clone().setAlpha(.3).toRGBAString(),borderWidth:"1px"}},e.buttons),o=e.css&&"string"==typeof e.css&&e.css.length>0?e.css:"";return{color:t.toRGBAString(),lightColor:t.clone().setAlpha(.3).toRGBAString(),textOnColor:t.isLight()?"#000000":"#ffffff",linkColor:n,font:r,buttons:i,css:o}}var se={theme:oe()},ae=function(){return{setTheme:function(e,t){return{theme:Object(P.e)(e.theme,oe(t))}}}};function ce(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function ue(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?ce(Object(n),!0).forEach((function(t){I()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):ce(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var pe={consentPopup:{enable:!0,open:!1,defaultChoice:void 0,enableAllButtons:!0,showWhenConsentIsMissing:!1,canCloseWhenConsentIsMissing:!0,view:"preferences",preferencesView:"purposes",information:{enable:!1,content:{text:{}}},denyAppliesToLI:!0}},le=function(){return{hideConsentPopup:function(e){return{consentPopup:ue(ue({},e.consentPopup),{},{open:!1})}},disableConsentPopup:function(e){return{consentPopup:ue(ue({},e.consentPopup),{},{enable:!1})}},enableConsentPopup:function(e){return{consentPopup:ue(ue({},e.consentPopup),{},{enable:!0})}},showConsentPopup:function(e){return{consentPopup:ue(ue({},e.consentPopup),{},{open:!0})}},switchViewConsentPopup:function(e,t){return{consentPopup:ue(ue({},e.consentPopup),{},{view:t})}},switchPreferencesViewConsentPopup:function(e,t){return{consentPopup:ue(ue({},e.consentPopup),{},{preferencesView:t})}},setConsentPopupConfig:function(e,t){return{consentPopup:Object(P.e)(e.consentPopup,t)}}}},fe={website:{name:null,apiKey:null,providerKey:null,privacyPolicyURL:null,ignoreCountry:!1,purposes:[],disabledPurposes:[],essentialPurposes:[],vendors:[],customSDK:null,enableGlobalConsentForAllVendorsAndPurposes:!1,alwaysDisplayActionButtons:!1,regulations:{ccpa:{enabled:!1},gdpr:{enabled:!0,additionalCountries:[]}},openDialogsCount:0,iabStacks:[],enabledTCFAPIErrorLogging:!1,google:{additionalConsent:{positive:null,negative:null},fullATP:!1},publisherCountryCode:null,consentDuration:31622400}},de=function(){return{setIgnoreCountry:function(e,t){return{website:Object(P.e)(e.website,{ignoreCountry:t})}},setPrivacyPolicyURL:function(e,t){return{website:Object(P.e)(e.website,{privacyPolicyURL:t})}},setWebsiteConfig:function(e,t){return{website:Object(P.e)(e.website,t)}},setProviderKey:function(e,t){return{website:Object(P.e)(e.website,{providerKey:t})}},setAPIKey:function(e,t){return{website:Object(P.e)(e.website,{apiKey:t})}},setOpenDialogsCount:function(e,t){return{website:Object(P.e)(e.website,{openDialogsCount:t})}},setIABStacks:function(e,t){return{website:Object(P.e)(e.website,{iabStacks:t})}}}},ve={languages:{enabled:n(47).a,default:"en"}},he=function(){return{setLanguagesConfig:function(e,t){return{languages:Object(P.e)(e.languages,t)}}}};function ge(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function be(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?ge(Object(n),!0).forEach((function(t){I()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):ge(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var ye={experiment:{config:null,id:null,size:null,group:null,startDate:null}},me=function(){return{setExperimentConfig:function(e,t){return{experiment:be(be({},e.experiment),{},{config:t})}},setExperimentGroup:function(e,t){return{experiment:be(be({},e.experiment),{},{group:t})}},setExperimentID:function(e,t){return{experiment:be(be({},e.experiment),{},{id:t})}},setExperimentSize:function(e,t){return{experiment:be(be({},e.experiment),{},{size:t})}},setExperimentStartDate:function(e,t){return{experiment:be(be({},e.experiment),{},{startDate:t})}}}},Se=n(14);function Oe(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function Ce(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?Oe(Object(n),!0).forEach((function(t){I()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):Oe(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var we={databases:{vendors:{},purposes:{},specialPurposes:{},features:{},stacks:{},iabVendorList:null}},Pe=function(){return{addFeaturesToDatabase:function(e,t){if(!Array.isArray(t))return{};for(var n={},r=0;r<t.length;r++){var i=t[r];n[i.id]=i}return{databases:Ce(Ce({},e.databases),{},{features:Ce(Ce({},Object(P.f)(e,"databases.features")),n)})}},addVendorsToDatabase:function(e,t){if(!Array.isArray(t))return{};for(var n={},r=0;r<t.length;r++){var i=t[r];i.policyUrl&&(i.policyUrl=Object(Se.b)(i.policyUrl)),n[i.id]=i}return{databases:Ce(Ce({},e.databases),{},{vendors:Ce(Ce({},Object(P.f)(e,"databases.vendors")),n)})}},addPurposesToDatabase:function(e,t){if(!Array.isArray(t))return{};for(var n=Object(P.f)(e,"databases.purposes")||{},r=0;r<t.length;r++){var i=t[r];n[i.id]=i}return{databases:Ce(Ce({},e.databases),{},{purposes:Ce(Ce({},Object(P.f)(e,"databases.purposes")),n)})}},addSpecialPurposesToDatabase:function(e,t){if(!Array.isArray(t))return{};for(var n={},r=0;r<t.length;r++){var i=t[r];n[i.id]=i}return{databases:Ce(Ce({},e.databases),{},{specialPurposes:Ce(Ce({},Object(P.f)(e,"databases.specialPurposes")),n)})}},addStacksToDatabase:function(e,t){if(!Array.isArray(t))return{};for(var n={},r=0;r<t.length;r++){var i=t[r];n[i.id]=i}return{databases:Ce(Ce({},e.databases),{},{stacks:Ce(Ce({},Object(P.f)(e,"databases.stacks")),n)})}},setIABVendorList:function(e,t){var n=e.databases||{};return n.iabVendorList=t,{databases:n}},setIABTexts:function(e,t){for(var n=e.databases.vendors,r=0,i=t.vendors;r<i.length;r++){var o=i[r];n[o.id]&&(n[o.id].name=o.name,n[o.id].policyUrl=o.policyUrl,n[o.id].cookieMaxAgeSeconds=o.cookieMaxAgeSeconds,n[o.id].usesNonCookieAccess=o.usesNonCookieAccess,n[o.id].deviceStorageDisclosureUrl=o.deviceStorageDisclosureUrl)}return{databases:Ce(Ce({},e.databases),{},{vendors:n})}}}},ke=n(41),je={cookies:{didomiTokenCookieName:"didomi_token",ccpaDidomiTokenCookieName:"didomi_token_ccpa",iabCookieName:"euconsent-v2",storageSources:{cookies:!0,localStorage:!0},isSameSiteRequired:Object(ke.b)(window)}},_e=function(){return{setStorageConfig:function(e,t){return{cookies:Object(P.e)(e.cookies,t)}}}},Ie={cookies:{group:{enabled:!1,customDomain:null},thirdPartyCookiesData:null}},Ae=function(){return{setThirdPartyCookiesConfig:function(e,t){return{cookies:Object(P.e)(e.cookies,t)}},setThirdPartyCookiesData:function(e,t){return{cookies:Object(P.e)(e.cookies,{thirdPartyCookiesData:t})}}}},Te=n(19),Ee={cookies:{local:{customDomain:Object(Te.c)(document.location.hostname)},localCookiesData:{}}},Le=function(){return{setLocalCookiesConfig:function(e,t){return{cookies:Object(P.e)(e.cookies,t)}},setLocalCookiesData:function(e,t){return{cookies:Object(P.e)(e.cookies,{localCookiesData:t})}}}},De=n(37);function xe(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function Re(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?xe(Object(n),!0).forEach((function(t){I()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):xe(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var Ve={remoteConsents:{},pendingConsents:{},isUserAuthenticated:!1,callbackURL:null},Be=function(){return{loadRemoteConsents:function(e,t){return Re(Re({},e),{},{remoteConsents:Object(P.e)(e.remoteConsents,t)})},setUserAuthenticated:function(e,t){return Re(Re({},e),{},{isUserAuthenticated:t})},setCallbackURL:function(e,t){return Re(Re({},e),{},{callbackURL:t})},setRemoteConsents:function(e,t){return Re(Re({},e),{},{remoteConsents:Re(Re({},e.remoteConsents),{},{consents:Object(P.e)(e.remoteConsents.consents,t)})})},setPendingConsent:function(e,t){var n=t.purposeId,r=t.preferenceId,i=t.channelId,o=t.data,s=null,a=null;n?(s=n,a="consents.purposes.".concat(n),r&&(s+="_".concat(r),a+=".preferences.".concat(r)),i&&(s+="_".concat(i),a+=".channels.".concat(i))):i&&(s=i,a="consents.channels.".concat(i));var c=Object(P.f)(e.remoteConsents,"".concat(a),{}),u=c.metadata,p=void 0===u?{}:u,l={enabled:c.enabled,metadata:p};o.metadata=void 0===o.metadata?{}:o.metadata;var f={purposeId:n,preferenceId:r,channelId:i,data:Object(P.e)(Object(P.e)(l,Object(P.f)(e.pendingConsents,"".concat(s,".data"),{})),o)};return JSON.stringify(f.data)!==JSON.stringify(l)?Re(Re({},e),{},{pendingConsents:Re(Re({},e.pendingConsents),{},I()({},s,f))}):e.pendingConsents[s]?Re(Re({},e),{},{pendingConsents:Re({},Object.keys(e.pendingConsents).filter((function(e){return e!==s})).reduce((function(t,n){return t[n]=e.pendingConsents[n],t}),{}))}):e},resetPendingConsents:function(e){return Re(Re({},e),{},{pendingConsents:{}})}}},Fe={events:{sampleSizes:{},template:{source:{type:"sdk-web",domain:location.host},user:{agent:navigator.userAgent,id_type:"uuid"}}}},Ue=function(){return{setEventsConfig:function(e,t){return{events:Object(P.e)(e.events,t)}}}};function Me(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function Ne(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?Me(Object(n),!0).forEach((function(t){I()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):Me(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var ze={ui:{loading:!1,loaded:!1,module:null,spatialNavigation:!1}},Ge=function(){return{loadingUI:function(e){return{ui:Ne(Ne({},e.ui),{},{loading:!0})}},loadedUI:function(e){return{ui:Ne(Ne({},e.ui),{},{loaded:!0,loading:!1})}},setUIModule:function(e,t){return{ui:Ne(Ne({},e.ui),{},{module:t})}},enableSpatialNavigation:function(e){return{ui:Ne(Ne({},e.ui),{},{spatialNavigation:!0})}}}},qe={components:{helpersEnabled:!1,componentsEnabled:!1,version:1}},We=function(){return{setComponentsConfig:function(e,t){return{components:Object(P.e)(e.components,t)}}}};function Ke(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function He(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?Ke(Object(n),!0).forEach((function(t){I()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):Ke(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}for(var Je={optoutPreferences:{ccpaCategory:null,purposes:[],sellMyDataState:!0,purposesState:{},vendors:[],allPartnersState:!0,vendorsState:{}}},Qe=function(){return{setCCPACategory:function(e,t){return{optoutPreferences:He(He({},e.optoutPreferences),{},{ccpaCategory:t})}},setPurposes:function(e,t){return{optoutPreferences:He(He({},e.optoutPreferences),{},{purposes:t})}},setPurposeState:function(e,t,n){return{optoutPreferences:He(He({},e.optoutPreferences),{},{purposesState:He(He({},e.optoutPreferences.purposesState),{},I()({},t,n))})}},setPurposesStates:function(e,t){return{optoutPreferences:He(He({},e.optoutPreferences),{},{purposesState:t})}},setSellMyDataState:function(e,t){return{optoutPreferences:He(He({},e.optoutPreferences),{},{sellMyDataState:t})}},setVendorState:function(e,t,n){return{optoutPreferences:He(He({},e.optoutPreferences),{},{vendorsState:He(He({},e.optoutPreferences.vendorsState),{},I()({},t,n))})}},setVendorsStates:function(e,t){return{optoutPreferences:He(He({},e.optoutPreferences),{},{vendorsState:t})}},setAllPartnersState:function(e,t){return{optoutPreferences:He(He({},e.optoutPreferences),{},{allPartnersState:t})}},setVendors:function(e,t){return{optoutPreferences:He(He({},e.optoutPreferences),{},{vendors:t})}}}},Ye=[r,i,o,s,a,c,u,p,l,f,d,v,h,De,g,b,y,m,S],Ze={},Xe=0;Xe<Ye.length;Xe++){var $e=Ye[Xe];Ze[Object.keys($e.initialState)[0]]=$e.actions}function et(e){for(var t={},n=0;n<Ye.length;n++){var r=Ye[n];Object(P.d)(t,Object(w.bindActions)(r.actions,e))}return t}var tt,nt,rt,it=(nt=tt||function(){for(var e={},t=0;t<Ye.length;t++){var n=Ye[t];Object(P.d)(e,n.initialState)}return e}(),{store:rt=C()(nt,[]),actions:et(rt)}),ot=it.store,st=it.actions},function(e,t,n){"use strict";n.d(t,"e",(function(){return u})),n.d(t,"a",(function(){return p})),n.d(t,"b",(function(){return l})),n.d(t,"c",(function(){return f})),n.d(t,"d",(function(){return d}));var r=n(1),i=n.n(r),o=n(10),s=n(28),a=n(9),c=n(15),u=function(e){return e.iab.consentStringPresentFromStorage},p=Object(o.a)((function(e){return e.consent.updated}),s.a),l=function(e){return e.iab.decodedAdditionalConsent},f=Object(o.a)((function(e){return e.consent.sync}),s.a),d=function(e,t){return Object(o.a)([a.z],(function(e){var n=e.vendorIdsWithOnlyEssentialConsentPurposes,r=e.vendorIdsWithOnlyEssentialLegIntPurposes,o=Object(c.a)([].concat(i()(n),i()(r))),s=t.disabled.filter((function(e){return-1===o.indexOf(e)}));return{enabledVendors:[].concat(i()(t.enabled),i()(o)),disabledVendors:s}}))(e)}},function(e){e.exports=JSON.parse('{"v":161,"l":"2022-09-15T16:05:31Z","gsv":2,"tpv":2,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2,3],"sf":[1,2],"s":[{"i":1,"p":[1,2,3,4,7,8,9,10],"fp":[2,3,4,7,8,9,10],"sp":[1,2],"f":[1,3]},{"i":2,"p":[1,2,3,4,7,9,10],"sp":[1,2],"f":[2],"sf":[2]},{"i":4,"p":[1,2,3,4,7,9,10],"f":[1,2,3],"sf":[1]},{"i":6,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[3]},{"i":7,"p":[1,3,4,5,6,7,8,9,10],"sp":[1],"f":[3]},{"i":8,"p":[1,3,4],"fp":[2,9],"sp":[1,2],"l":[2,7,8,9],"f":[1,2]},{"i":9,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2,3],"sf":[1]},{"i":10,"p":[1,2,7],"fp":[2,7],"sp":[1,2],"f":[3],"sf":[1]},{"i":11,"p":[1,3,4],"fp":[2,7,8,9,10],"sp":[1,2],"l":[2,7,8,9,10],"f":[1,2,3]},{"i":12,"p":[1,2,3,4,7],"sp":[1,2],"f":[1,3],"sf":[1]},{"i":13,"p":[1,2,3,5,7,8,9,10],"sp":[1,2],"f":[1,2,3]},{"i":14,"p":[1,3,4,9,10],"sp":[1,2],"l":[2,7],"f":[3],"sf":[1,2]},{"i":15,"p":[1,3,4,5,6,8,9,10],"sp":[1,2],"l":[2,7],"f":[2]},{"i":16,"p":[1,2,3,4,7,10],"sp":[1]},{"i":18,"p":[1,2,3,4,7],"fp":[2,3,4,7],"f":[2,3],"sf":[1,2]},{"i":20,"p":[1,3,4],"fp":[2,3,4,5,7,8,9,10],"sp":[1,2],"l":[2,5,7,8,9,10],"f":[2],"sf":[1]},{"i":21,"p":[1,3,4],"fp":[2,7,10],"sp":[1,2],"l":[2,7,10],"f":[1,2,3],"sf":[1]},{"i":22,"p":[1,7,8]},{"i":23,"p":[1,2,3,4],"sp":[1,2],"l":[7,9,10],"f":[1,2,3]},{"i":24,"p":[1,2,3,4,5,6,7,9,10],"sp":[1,2],"f":[1,2,3]},{"i":25,"p":[1,3,4,5,6],"fp":[2,7,8,9,10],"sp":[1,2],"l":[2,7,8,9,10],"f":[1,2,3],"sf":[1]},{"i":26,"p":[1,2,3,4,7,8,9,10],"f":[3]},{"i":27,"p":[1,4,7],"fp":[4,7],"sp":[1,2],"l":[2]},{"i":28,"p":[1],"fp":[2,7,9,10],"sp":[1,2],"l":[2,7,9,10],"sf":[1]},{"i":29,"p":[1,2,3,4,7,8,10],"f":[1]},{"i":30,"p":[1,3,4],"fp":[2],"sp":[1,2],"l":[2],"f":[2]},{"i":31,"p":[1],"fp":[2,7,9,10],"sp":[1,2],"l":[2,7,9,10],"f":[1,3]},{"i":32,"p":[1,3,4],"fp":[2,7,10],"sp":[1,2],"l":[2,7,10],"f":[2],"sf":[1]},{"i":33,"p":[1,3,5],"f":[1,2,3]},{"i":34,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[3]},{"i":36,"p":[1,3,9],"sp":[1,2],"l":[2,4,7,10],"f":[1,2,3]},{"i":37,"p":[1,3,4,7],"sp":[1,2],"f":[1,2],"sf":[2]},{"i":39,"p":[1,2,3,4,7,9,10],"fp":[2,3,4,7,9,10],"sp":[1,2],"f":[1,2,3],"sf":[1]},{"i":40,"p":[1,2,3,4,7,9,10],"fp":[2,3,4,7,9,10],"sp":[1,2],"f":[1,2,3],"sf":[1]},{"i":41,"p":[1,2,3,4,5,6,7,10],"sp":[1,2]},{"i":42,"p":[1,2,3,4,5,6,7,8,10],"fp":[2,3,4,5,6,7,8,10],"sp":[1,2],"f":[1,2,3]},{"i":44,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2,3]},{"i":45,"p":[1,2,4,7,10],"sp":[1,2],"f":[3],"sf":[1]},{"i":46,"fp":[7,8],"sp":[1,2],"l":[7,8],"f":[3]},{"i":47,"p":[1,2,4,7],"sp":[1,2]},{"i":48,"p":[1,3,4],"fp":[2,3,4,7,9,10],"sp":[1,2],"l":[2,7,9,10],"f":[3]},{"i":49,"p":[1,2,3,4,5,6],"fp":[7,8,9,10],"l":[7,8,9,10],"f":[1,2],"sf":[1]},{"i":50,"p":[1,3,4],"fp":[2,7,10],"sp":[1,2],"l":[2,7,10],"f":[2,3]},{"i":51,"p":[1,2,3,4,7,9,10],"sp":[1,2],"f":[1,2,3],"sf":[1]},{"i":52,"p":[1],"fp":[2,7,10],"sp":[1,2],"l":[2,7,10],"sf":[1]},{"i":53,"p":[1,3,4,5,6,9],"fp":[2,7,8,10],"sp":[1,2],"l":[2,7,8,10],"f":[1,2,3]},{"i":56,"sp":[1,2]},{"i":57,"p":[1,2,3,4],"sp":[1,2],"l":[7,9,10],"f":[1,2,3]},{"i":58,"p":[1,2,3,4,7,10],"sp":[1,2],"f":[2,3],"sf":[2]},{"i":59,"p":[2],"fp":[2],"f":[3],"sf":[1]},{"i":60,"p":[1,3,4],"fp":[2,3,4,7,9,10],"sp":[1,2],"l":[2,7,9,10],"f":[1,2,3]},{"i":61,"p":[1,2,3,4,7],"fp":[2,3,4,7],"sp":[1,2],"f":[3]},{"i":62,"p":[1,2,4,10],"fp":[4,7,10],"sp":[1,2],"l":[7]},{"i":63,"p":[1,3,4],"sp":[1,2],"l":[2,7,10],"f":[1,2,3],"sf":[1]},{"i":65,"p":[1,7,8,9,10],"f":[1],"sf":[1]},{"i":66,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8,9,10],"f":[1,2,3],"sf":[1]},{"i":67,"p":[1,3,4],"fp":[2,5,6,7,8,10],"sp":[1,2],"l":[2,5,6,7,8,10],"f":[3],"sf":[1]},{"i":68,"p":[1,3,4],"fp":[2,3,4,7,9,10],"sp":[1,2],"l":[2,7,9,10],"f":[1,2,3]},{"i":69,"p":[1],"fp":[2,7,10],"sp":[1,2],"l":[2,7,10]},{"i":70,"p":[1,2,3,4,7,10],"sp":[1,2],"f":[1,2,3],"sf":[1]},{"i":71,"p":[1,2,3,4,7,9,10],"fp":[2,3,4,7,9,10],"sp":[1,2],"f":[1,2,3],"sf":[1]},{"i":72,"p":[1,2,3,4,7,9,10],"sp":[1,2]},{"i":73,"p":[1,2,3,4,10],"f":[2],"sf":[1]},{"i":75,"sp":[1,2],"f":[1,2,3],"sf":[2]},{"i":76,"p":[1,3,4],"fp":[2,3,4,5,6,7,8,9,10],"l":[2,5,6,7,8,9,10],"f":[1,2,3],"sf":[1]},{"i":77,"p":[1,7,8,9,10],"fp":[7,8,9,10],"sp":[1],"f":[1,2,3]},{"i":78,"p":[1,2,3,4,7],"f":[2,3]},{"i":79,"p":[1,3,4],"fp":[2,7,10],"sp":[1,2],"l":[2,7,10],"f":[1,2,3],"sf":[1]},{"i":80,"p":[1,2],"sp":[1,2],"l":[7]},{"i":81,"p":[1,2,3,4,7,9,10],"sp":[1,2],"f":[1,2],"sf":[1]},{"i":82,"p":[1,2,3,4,7,9],"fp":[2,7,9,10],"sp":[1,2],"l":[10],"f":[3],"sf":[1]},{"i":83,"fp":[8],"sp":[2],"l":[8]},{"i":84,"p":[1,3,9,10]},{"i":85,"p":[1,3,4],"fp":[2,7,8,9,10],"sp":[1,2],"l":[2,7,8,9,10],"f":[1,3],"sf":[1]},{"i":86,"p":[1],"fp":[2,3,4,7],"sp":[1,2],"l":[2,3,4,7,10]},{"i":87,"p":[1,2,3,4,7,8,9,10],"fp":[2,3,4,7,8,9,10],"sp":[1,2]},{"i":88,"p":[1,3,4],"fp":[2,3,4,7,10],"sp":[1,2],"l":[2,7,10],"f":[1,3]},{"i":89,"p":[1],"f":[2]},{"i":90,"p":[1,2,3,4,5,7,9,10]},{"i":91,"p":[1,2,3,4,7],"sp":[1],"f":[1,2,3]},{"i":92,"p":[1],"fp":[3,5,7,8,9],"l":[3,5,7,8,9],"f":[1,2]},{"i":93,"p":[1],"fp":[7],"sp":[1],"l":[7]},{"i":94,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2,3],"sf":[1]},{"i":95,"p":[1,3,5,7,8,10],"f":[1,2,3],"sf":[2]},{"i":97,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2]},{"i":98,"p":[1,2,3,4,5,6],"fp":[7,8,9,10],"sp":[1,2],"l":[7,8,9,10],"f":[1,2]},{"i":100,"p":[1,2,3,4,7,9,10],"sp":[1,2],"f":[2,3]},{"i":101,"p":[1,2,3,4,7,9,10],"sp":[1,2],"f":[1,2,3],"sf":[1]},{"i":102,"p":[1,2,6],"fp":[6,7,8,9,10],"sp":[1,2],"l":[7,8,9,10],"f":[1,2,3],"sf":[1,2]},{"i":104,"p":[1,2,3,4],"sp":[2],"l":[7,8],"f":[1]},{"i":108,"p":[1,2,3,4,7,9,10],"sp":[1,2],"sf":[1]},{"i":109,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2],"sf":[1]},{"i":110,"p":[1,7,9],"f":[1,2]},{"i":111,"p":[1,3,4,9,10],"fp":[2,7,8],"sp":[1,2],"l":[2,7,8],"f":[1]},{"i":114,"p":[1,2,3,4,7,9,10]},{"i":115,"p":[1,3,4],"fp":[2,3,4,7,10],"sp":[1,2],"l":[2,7,10],"f":[2]},{"i":119,"p":[1,3,4,7,8,10],"fp":[3,4,10],"sp":[1,2],"sf":[1]},{"i":120,"p":[1,3,5,9,10],"fp":[3,5,9,10],"sp":[1],"f":[1,2,3]},{"i":122,"p":[1,3,4,5,10],"fp":[2,7,8],"sp":[1,2],"l":[2,7,8]},{"i":124,"p":[1,2,3,4,7],"sp":[1,2],"f":[1],"sf":[1]},{"i":126,"fp":[2,7,10],"sp":[1,2],"l":[2,7,10]},{"i":127,"p":[1,3,4,5,6],"sp":[1,2],"l":[2,7,8,10],"f":[3],"sf":[1]},{"i":128,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,3],"sf":[1]},{"i":129,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2,3],"sf":[1]},{"i":130,"p":[1,2,3,4,5,6,7,9,10],"sp":[1,2],"f":[1,2]},{"i":131,"p":[1],"f":[2,3]},{"i":132,"p":[1,3,4,7,9,10],"fp":[2],"sp":[1,2],"l":[2],"f":[3]},{"i":133,"p":[1,3,5,7,8,9],"f":[1,2,3],"sf":[1,2]},{"i":134,"p":[1],"fp":[2,3,4,7,9,10],"sp":[1,2],"l":[2,3,4,7,9,10],"f":[1,2,3]},{"i":136,"p":[1,3,4],"fp":[2,3,4,7,9,10],"sp":[1,2],"l":[2,7,9,10]},{"i":137,"p":[1,3,4],"fp":[2,3,4,7,9,10],"sp":[1,2],"l":[2,7,9,10],"f":[1,2],"sf":[1]},{"i":138,"p":[1,2,3,4,7,10],"fp":[2,7,10],"sp":[1,2],"f":[3],"sf":[1]},{"i":139,"p":[2,3,4,7,8,9,10],"fp":[7,8,9,10],"sp":[1,2]},{"i":140,"p":[1,2,3,4,7,10],"sp":[1,2],"f":[2,3],"sf":[1]},{"i":141,"p":[2,3,4,5,6,7,8,9,10],"sp":[1],"f":[1,3],"sf":[1]},{"i":142,"p":[1,3,4],"fp":[2,5,6,8,9],"sp":[1,2],"l":[2,5,6,7,8,9,10],"f":[3]},{"i":143,"p":[1,2],"f":[3]},{"i":144,"p":[1,2,4,7,10],"sp":[2],"f":[3],"sf":[1]},{"i":145,"p":[1],"sp":[1,2],"l":[2,7,8,9,10],"f":[3]},{"i":147,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[7,8,9,10],"sp":[1,2],"f":[3],"sf":[1]},{"i":148,"p":[2,7]},{"i":149,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2],"f":[2,3]},{"i":150,"p":[1,3,4,9,10],"fp":[2,7],"sp":[1,2],"l":[2,7],"f":[2,3]},{"i":151,"p":[1,3,4],"fp":[2,3,4,7],"sp":[1,2],"l":[2,7]},{"i":152,"p":[1,9],"fp":[7],"sp":[1],"l":[7]},{"i":153,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2,3],"sf":[1,2]},{"i":154,"p":[1,3,4,10],"fp":[2,7],"sp":[1,2],"l":[2,7],"f":[3],"sf":[1]},{"i":155,"p":[1,2,3,4,7],"sp":[2]},{"i":156,"p":[1,3,4],"sp":[1,2],"l":[2,7,10],"f":[2,3],"sf":[1]},{"i":157,"p":[1,2,3,4,7,10],"sp":[1,2]},{"i":158,"p":[1,2,3,4,7,9,10],"f":[1,2,3],"sf":[1]},{"i":159,"p":[1,2,7],"sp":[1,2]},{"i":160,"p":[1,2,3,4,5,6,7,8,9,10],"f":[1,2,3],"sf":[1,2]},{"i":161,"p":[1,2,3,4,7,10],"sp":[1,2],"f":[1,2,3],"sf":[1]},{"i":162,"p":[1,2,3,4,7,9,10],"sp":[1,2],"f":[1,2,3],"sf":[1]},{"i":163,"p":[1,3],"fp":[7,9,10],"sp":[1],"l":[7,9,10],"f":[1,3]},{"i":164,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,3]},{"i":165,"p":[1,3,4],"fp":[2,3,4,7,8,9,10],"sp":[1,2],"l":[2,7,8,9,10],"f":[3],"sf":[2]},{"i":167,"p":[1,9],"f":[1,2,3],"sf":[1,2]},{"i":168,"p":[1,2,3,4,5,6,7,8,9,10],"f":[1,2,3],"sf":[1]},{"i":170,"p":[7,8,9,10],"fp":[7,8,9,10],"f":[1,2],"sf":[1]},{"i":173,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2,3]},{"i":174,"p":[2,6,7,10],"fp":[2,6,7,10],"sp":[1,2]},{"i":177,"p":[1],"fp":[7,8,10],"sp":[1,2],"l":[7,8,10]},{"i":178,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,3]},{"i":179,"p":[1,2,3,4,9],"sp":[1,2],"l":[7],"sf":[1]},{"i":183,"p":[1,3,4,5,6,8],"fp":[2,7,9,10],"sp":[1,2],"l":[2,7,9,10],"f":[1,2,3],"sf":[1]},{"i":184,"p":[1,3],"sp":[2],"f":[3]},{"i":185,"p":[1,2,3,4,7,8],"sp":[1,2],"l":[9,10],"f":[1,2,3]},{"i":190,"p":[1,2,3,4,7,8,9,10],"sp":[1,2],"f":[1,3]},{"i":192,"p":[1,2,3,4,7]},{"i":193,"p":[1,2,3,4,7,9,10],"f":[2,3],"sf":[1]},{"i":194,"p":[1,2,3,4],"fp":[2,7,8,9,10],"sp":[1,2],"l":[7,8,9,10],"f":[3]},{"i":195,"p":[1,3,4],"fp":[2,7],"sp":[1,2],"l":[2,7]},{"i":196,"p":[1,2,3,4,7],"fp":[2,7],"sp":[1,2],"f":[2,3],"sf":[1]},{"i":198,"p":[1,2,3,4,7],"fp":[3,4,7]},{"i":199,"p":[1,2,3,4,6,7,9],"sf":[1]},{"i":200,"p":[1,9],"fp":[2,3,4,7,9,10],"sp":[1,2],"l":[2,3,4,7,10],"f":[2,3]},{"i":202,"p":[1,2,3,4,5,6],"fp":[7,8,9,10],"sp":[1,2],"l":[7,8,9,10],"f":[1,2,3],"sf":[1,2]},{"i":203,"p":[1],"fp":[2,3,4,5,6],"sp":[1,2],"l":[2,3,4,5,6,7,8,9,10]},{"i":205,"l":[7,8,9,10]},{"i":206,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8,9,10],"f":[1,2,3],"sf":[1,2]},{"i":208,"p":[2,3,4,7,10],"sp":[2],"f":[1,3],"sf":[1]},{"i":209,"p":[1,2,3,4],"fp":[2,7,10],"sp":[1,2],"l":[7,10],"sf":[1]},{"i":210,"p":[1,2,3,4,7,9,10],"sp":[1,2],"f":[1,3]},{"i":211,"p":[1,2,3,4,5,6,7,8,9,10],"f":[1,2,3],"sf":[1,2]},{"i":212,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2]},{"i":213,"p":[1,2,3,5,7,8,9,10],"fp":[2,9,10],"f":[1,2,3]},{"i":215,"p":[1,2,7]},{"i":216,"p":[1,2,3,5,7,8,9,10],"sp":[1],"f":[1,2]},{"i":217,"p":[1],"fp":[2,3,4,7,9,10],"sp":[1,2],"l":[2,3,4,7,9,10]},{"i":218,"p":[1,3,4],"sp":[1],"l":[2,5,6,7,8,9,10],"f":[3],"sf":[1]},{"i":223,"p":[1],"fp":[7,8],"l":[7,8],"f":[2]},{"i":224,"p":[1,2,3,4,5,6,7,8],"fp":[2,3,4,5,6,7,8],"sf":[1]},{"i":226,"p":[1,2,3,4,5,6,7,8,9,10],"f":[1,2,3]},{"i":227,"p":[1,2,3,4,5,6,7,9,10],"fp":[2,3,4,5,6,7,9,10],"sp":[1,2],"f":[1,2,3],"sf":[1]},{"i":228,"p":[1,2,3,4,5,6,7,8,9,10]},{"i":230,"p":[1],"sp":[1,2],"l":[2,3,4,5,6,7,8,9,10],"f":[1,2,3]},{"i":231,"p":[1,3,4],"fp":[3,4],"sp":[1,2],"l":[2,7,8,10],"f":[2]},{"i":232,"p":[1],"l":[7],"f":[1,2,3]},{"i":234,"p":[1,3,4,9],"sp":[1,2],"l":[2,7,10],"f":[1]},{"i":235,"p":[1,2,3,4,7,9],"fp":[2,3,4,7,9],"sp":[1,2],"f":[1,2,3],"sf":[1]},{"i":236,"p":[1,2],"fp":[3,4,5,6],"sp":[1,2],"l":[3,4,5,6,7,8],"f":[1]},{"i":237,"p":[1,2,3,4,7,9,10],"sp":[1,2],"f":[1,2,3],"sf":[1]},{"i":238,"p":[1,2,3,4],"sp":[2],"l":[7,9,10],"f":[1,2,3],"sf":[1]},{"i":239,"p":[1,4],"fp":[2,7,8,9,10],"sp":[1,2],"l":[2,7,8,9,10],"f":[3],"sf":[1]},{"i":240,"p":[1],"sp":[1,2],"l":[5,6,8,10]},{"i":241,"p":[1,2,3,4,7,9,10],"fp":[7],"sp":[1,2],"f":[1,2,3],"sf":[1]},{"i":242,"p":[1,2,3,4,7,10],"fp":[2,3,4,7],"sp":[1,2],"f":[3],"sf":[1]},{"i":243,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2,3],"sf":[1]},{"i":244,"p":[1,2,3,4,5,6,7,8,9,10],"f":[1,2,3]},{"i":246,"p":[1,3,4,8],"fp":[2,7],"sp":[1,2],"l":[2,7]},{"i":248,"p":[1],"fp":[2],"sp":[2],"l":[2],"f":[3]},{"i":249,"p":[1,2,4,7,10],"sp":[1,2],"f":[2,3],"sf":[1]},{"i":250,"p":[2,3,4,5,6,7,8,9,10],"sp":[2]},{"i":251,"p":[1],"fp":[2,3,4,7,8,9,10],"sp":[1,2],"l":[2,3,4,7,8,9,10]},{"i":252,"p":[1],"fp":[2,3,4,7,9,10],"sp":[1,2],"l":[2,3,4,7,9,10],"f":[3],"sf":[1]},{"i":253,"p":[1,3,4,9],"fp":[2,7,10],"sp":[1,2],"l":[2,7,10],"f":[3],"sf":[1]},{"i":254,"p":[1,2,3,4,7],"sp":[1,2],"f":[3],"sf":[1]},{"i":255,"p":[1,3,4,5,6],"fp":[2,7,8],"sp":[2],"l":[2,7,8]},{"i":256,"p":[1],"fp":[2,3,4],"sp":[1,2],"l":[2,3,4,7,9,10],"f":[1,2],"sf":[1]},{"i":259,"p":[1,3,4],"fp":[2,7],"sp":[1,2],"l":[2,7],"f":[3]},{"i":261,"p":[1],"fp":[3],"sp":[1,2],"l":[3,5,7,8],"f":[1,2]},{"i":262,"p":[1,2,3,4,5,7],"f":[3],"sf":[1]},{"i":263,"p":[1,3,4],"sp":[1,2],"l":[2,7,9,10],"f":[2]},{"i":264,"p":[1,2,3,4,10],"fp":[2],"sp":[1,2],"l":[7],"f":[3]},{"i":265,"p":[1,2,3,4,5,6,7,8],"sp":[1,2],"l":[9,10],"f":[3],"sf":[1]},{"i":266,"p":[1,2,3,4,5,6,7,8,9],"f":[1,2,3]},{"i":270,"p":[1]},{"i":272,"p":[1,2,3,4,7,9,10],"f":[1,2,3],"sf":[1]},{"i":273,"p":[1,4],"sp":[1,2],"l":[7]},{"i":274,"p":[1,2,3,4,7,9,10],"sp":[1,2],"f":[2]},{"i":275,"p":[1,2,3,4,7,9,10],"sp":[1,2],"f":[1,2,3],"sf":[1]},{"i":276,"p":[1,3,4,9,10],"fp":[2,7,8],"sp":[1,2],"l":[2,7,8],"f":[1]},{"i":277,"p":[1,2,3,4,5,6,7,8,9],"fp":[8],"sp":[1,2],"l":[10],"f":[1,2,3]},{"i":278,"fp":[7,10],"sp":[1],"l":[7,10]},{"i":279,"fp":[2,7],"sp":[1,2],"l":[2,7]},{"i":280,"p":[1],"fp":[2,3,4,7,10],"sp":[1,2],"l":[2,3,4,7,10]},{"i":281,"p":[1,7,8,9],"fp":[7,8,9],"f":[1,2]},{"i":282,"p":[1],"fp":[2],"sp":[2],"l":[2]},{"i":284,"p":[1,3,4],"fp":[2,5,6,7,8,9,10],"sp":[1,2],"l":[2,5,6,7,8,9,10],"f":[1,2],"sf":[1]},{"i":285,"p":[1,2,4],"fp":[7,10],"sp":[1,2],"l":[7,10],"f":[3]},{"i":289,"p":[1,2,3,4,7,9,10],"f":[1],"sf":[1]},{"i":290,"p":[1,2,3,4,7],"sp":[1,2],"l":[10]},{"i":293,"p":[1,2,4,6,7,8,9,10],"fp":[2],"sp":[1],"f":[3],"sf":[2]},{"i":294,"p":[1,2,3,4,5,7],"fp":[2,3,4,5,7],"sp":[1,2],"f":[1,2,3],"sf":[1]},{"i":295,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8,9,10],"sp":[2],"f":[1,2]},{"i":297,"p":[1,3,4],"fp":[2,7,8,10],"sp":[1,2],"l":[2,7,8,10]},{"i":298,"p":[1,3,10],"fp":[7],"sp":[1],"l":[7],"f":[1,2,3],"sf":[1,2]},{"i":299,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8,9,10],"sp":[2],"f":[1,2]},{"i":301,"p":[1,3,4,5,6,7,9,10],"f":[1,2,3]},{"i":302,"p":[1,2,7],"fp":[7],"f":[3],"sf":[1]},{"i":303,"p":[1,2,3,4,7,9]},{"i":304,"p":[1,2,3],"f":[1,2,3],"sf":[1]},{"i":308,"p":[1,2,4],"fp":[2,4],"sp":[1,2]},{"i":310,"p":[1,2,3,4,9],"sp":[1,2],"l":[7,10],"f":[1,2,3],"sf":[1]},{"i":311,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"sf":[1]},{"i":312,"p":[1,7,8],"fp":[7,8],"sp":[1],"f":[2]},{"i":314,"p":[1,2,3,4,7,9,10],"fp":[2,3,4,7,9,10],"sp":[1,2]},{"i":315,"p":[1,2,4,7],"fp":[2,4,7],"sp":[1,2],"f":[3],"sf":[1]},{"i":316,"p":[1,2,3,4,5,6,7,8,9,10],"sf":[1]},{"i":317,"p":[1,2,3,4,5,6,7],"sp":[1,2]},{"i":318,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2,3]},{"i":319,"p":[1],"sp":[1,2],"l":[2,7,10],"sf":[1]},{"i":321,"p":[1,3,4,5,6,9],"fp":[2,7,8,10],"sp":[1,2],"l":[2,7,8,10],"f":[2]},{"i":323,"p":[1,2,3,4,5,6,7,8,9,10],"f":[1,2,3],"sf":[1,2]},{"i":325,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8],"sp":[1,2],"f":[1,2,3],"sf":[1]},{"i":326,"p":[1,2,3,4,7],"sp":[1,2]},{"i":328,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[2],"f":[3],"sf":[2]},{"i":329,"p":[1,7,8]},{"i":331,"p":[1,3,4,5,6],"sp":[1,2],"l":[2,7,8,9,10],"f":[2,3],"sf":[2]},{"i":333,"p":[1,2,3,4,7,9,10],"fp":[2,9],"sp":[1],"f":[1,2,3],"sf":[1]},{"i":334,"sp":[1,2],"f":[1,3],"sf":[1,2]},{"i":335,"p":[1],"fp":[2,3,4,7,8,9],"sp":[1,2],"l":[2,3,4,7,8,9],"f":[1,3],"sf":[1]},{"i":336,"p":[2,4],"fp":[2,4],"sp":[1,2],"l":[7,9],"f":[3]},{"i":337,"p":[1,2,3,4,5,6,7,8,9,10],"f":[2,3]},{"i":343,"p":[1],"fp":[2,3,4,5,6,7,8,9,10],"sp":[1,2],"l":[2,3,4,5,6,7,8,9,10],"f":[1,3],"sf":[1]},{"i":345,"p":[1,7,8,9,10],"f":[1,2,3],"sf":[1,2]},{"i":347,"p":[1,7,8,9],"fp":[6,10],"sp":[1,2],"l":[6,10],"f":[3],"sf":[1]},{"i":349,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[3]},{"i":350,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8,9,10],"sp":[1],"f":[1,2,3]},{"i":351,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8,9,10],"sp":[1],"f":[1,2,3]},{"i":354,"p":[1,2,4],"fp":[7],"sp":[1,2],"l":[6,7,8,10]},{"i":358,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2,3],"sf":[2]},{"i":359,"p":[3,4,9],"fp":[9],"sp":[1,2],"l":[2,7],"f":[3],"sf":[1]},{"i":360,"p":[1],"fp":[3,5,7,8,9],"l":[3,5,7,8,9],"f":[1,2]},{"i":361,"p":[1],"fp":[3,5,7,8,9],"l":[3,5,7,8,9],"f":[1,2]},{"i":365,"sp":[1],"l":[7],"f":[1,3],"sf":[1]},{"i":368,"p":[1,2,3,4,7,9],"sp":[1,2],"f":[1,2,3],"sf":[1]},{"i":371,"p":[1,3,4,5,6],"fp":[2,7,8,9,10],"sp":[1,2],"l":[2,7,8,9,10],"sf":[1]},{"i":373,"p":[1,3],"fp":[7,9],"sp":[1],"l":[7,9,10],"f":[1,2,3],"sf":[1]},{"i":374,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2]},{"i":375,"p":[1,2,3,4,5,6,7,8,9,10],"f":[3],"sf":[1]},{"i":377,"p":[1,2,3,4,5,6,8,9],"fp":[7,10],"sp":[1,2],"l":[7,10],"f":[1,2,3],"sf":[1,2]},{"i":378,"p":[1],"fp":[7],"sp":[1],"l":[7]},{"i":380,"p":[1,2,3,4,5,6,7,8,9],"sp":[1,2]},{"i":381,"p":[1,2,3,4,7,9,10],"sp":[1,2],"sf":[1]},{"i":382,"p":[1,2,3,4,5,6,7,8,9],"fp":[2,3,4,5,6,7,8,9],"sp":[1,2],"f":[3]},{"i":384,"sp":[1,2],"l":[7,8,9,10],"f":[3]},{"i":385,"p":[1,3,5,9,10],"l":[7],"f":[1,2]},{"i":387,"p":[2,3,4,7],"f":[3]},{"i":388,"p":[1,2,3,4,5,6,7,8,9,10],"f":[1,2,3],"sf":[1,2]},{"i":394,"p":[1,3,4,5,6],"fp":[2,7,8,9,10],"sp":[1,2],"l":[2,7,8,9,10],"f":[1,2]},{"i":397,"p":[1,2,3,4,7,9,10],"sp":[1,2],"f":[1,2,3]},{"i":402,"p":[1,7],"fp":[7],"sp":[1,2],"f":[3]},{"i":408,"p":[1,2,7],"fp":[2,7]},{"i":409,"p":[1,2,7,8,9,10],"f":[2]},{"i":410,"p":[1,2,7,10],"sp":[1,2],"f":[3]},{"i":412,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8,9,10],"f":[1,2,3],"sf":[1]},{"i":413,"p":[1,2,3,4,5,6,7,8,9,10],"f":[1,2,3]},{"i":415,"sp":[2]},{"i":416,"p":[1,2,3,4,5,6,7,8,10],"f":[1,2,3]},{"i":418,"p":[1,3,4,7,9,10],"fp":[2],"sp":[1,2],"l":[2],"f":[1,2,3],"sf":[1]},{"i":422,"p":[1,6,7,8,9]},{"i":423,"p":[1,2,3,4,5,6,7,8,9,10],"f":[1,2],"sf":[1]},{"i":424,"p":[4,7],"fp":[4]},{"i":427,"p":[1,2,3,4,5,6,7,8],"f":[1],"sf":[1]},{"i":428,"p":[1],"fp":[2,3,4],"sp":[1,2],"l":[2,3,4,7]},{"i":429,"p":[1,2,3,4,5,6,7,8,9,10],"f":[1,2,3],"sf":[1,2]},{"i":431,"sp":[1,2],"l":[7,9,10],"f":[1,3],"sf":[2]},{"i":434,"p":[1,2,3,4,7],"sp":[1,2],"f":[1,3]},{"i":435,"p":[1,3,4,7,9],"sp":[1],"f":[1,2,3],"sf":[1,2]},{"i":436,"p":[1,3,4,5,6,9],"fp":[2,7,8,10],"sp":[1,2],"l":[2,7,8,10],"f":[1,2,3]},{"i":438,"p":[1,2,3,4,7,9,10],"fp":[2,3,4,7,9,10],"f":[1,2]},{"i":439,"p":[1,7,9],"f":[3],"sf":[1]},{"i":440,"p":[1,4],"fp":[2,7,9,10],"sp":[1,2],"l":[2,7,9,10]},{"i":444,"p":[1],"fp":[2,3,5,6],"sp":[1,2],"l":[2,3,4,5,6,7,8,9,10]},{"i":447,"p":[2,3,4,7,9,10],"sf":[1]},{"i":448,"p":[1,2,3,4,7,9],"fp":[2,3,4,7,9],"sp":[1,2],"f":[1,2,3],"sf":[1,2]},{"i":450,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2,3],"sf":[1]},{"i":452,"p":[1,4],"fp":[2,7],"sp":[1,2],"l":[2,7],"f":[1,2]},{"i":455,"p":[1,2,3,4,10],"fp":[2,3,4,10],"sp":[1,2],"l":[7],"f":[1,2,3],"sf":[1]},{"i":458,"p":[1,2,3,4,7,9,10],"fp":[2,3,4,7,9,10],"sp":[1,2],"f":[3]},{"i":459,"p":[1],"sp":[1,2],"f":[3]},{"i":461,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8,9,10],"sp":[2],"f":[1,2,3]},{"i":462,"p":[1,2,3,4,5,6,9],"fp":[2,3,4,5,6,7,8,9],"sp":[1,2],"l":[7,8],"f":[2],"sf":[2]},{"i":466,"sp":[1,2],"l":[7]},{"i":467,"p":[1],"fp":[7],"l":[7],"f":[2,3]},{"i":468,"p":[1],"fp":[7,8,9],"l":[3,7,8,9],"f":[1,2]},{"i":469,"p":[1],"fp":[3,4],"sp":[1,2],"l":[2,3,4,5,6,7,8,9,10],"f":[1,2,3],"sf":[1]},{"i":471,"p":[1,2,7,8],"fp":[2,7,8],"sp":[1,2],"f":[3],"sf":[1,2]},{"i":473,"p":[1,2,3,4,5,6,7,8,10],"fp":[2,3,4,5,6,7,8,10],"f":[1,2,3]},{"i":475,"p":[1,2,3,4,5,6,7],"sp":[1],"l":[8,9,10],"f":[1,3],"sf":[1]},{"i":479,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2,3],"sf":[1,2]},{"i":482,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2],"sf":[1]},{"i":484,"sp":[1],"l":[7,10]},{"i":486,"p":[1],"sp":[1,2]},{"i":488,"p":[1],"fp":[2,7,8,10],"sp":[1,2],"l":[2,7,8,10]},{"i":490,"p":[1,2,3,4,7,8,9,10],"fp":[2,3,4,7,8],"sp":[1]},{"i":491,"p":[1,2,3,4,5,6,7,8,9,10]},{"i":493,"p":[1,2,3,4,5,6,7,8,10],"fp":[2,7,8],"sp":[2],"f":[1,2,3]},{"i":495,"p":[2,3,4,7,9,10],"sp":[1,2],"f":[3],"sf":[1]},{"i":496,"p":[1,2,4,7,9,10],"sp":[1,2]},{"i":497,"p":[1,3,9]},{"i":498,"p":[1,6,7,10],"fp":[2,3,4,9],"sp":[1,2],"l":[2,3,4,9],"f":[1],"sf":[1]},{"i":501,"p":[1,2,3,4,7,9],"f":[1,2]},{"i":502,"fp":[7,9,10],"sp":[1,2],"l":[7,9,10]},{"i":505,"p":[1,7,8],"sf":[1]},{"i":506,"p":[1,3,5,7,8,9,10],"f":[1,2]},{"i":507,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2,3],"sf":[1]},{"i":508,"p":[1,7,8,9],"fp":[7,8,9],"sp":[1],"f":[1,2,3]},{"i":509,"p":[1,2,7],"fp":[2,7]},{"i":511,"p":[1,2,3,4,5,7,9],"sp":[1,2],"l":[10],"f":[1,2],"sf":[1]},{"i":512,"p":[1,2,3,4,7,8,10],"f":[3],"sf":[1]},{"i":516,"p":[1,2,3,4,5,6,7,8,9,10]},{"i":517,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[3]},{"i":519,"p":[1,2,3,4,5,6,7,8,9,10]},{"i":520,"p":[1]},{"i":521,"p":[1,7]},{"i":524,"p":[1,2,3,4,7,9,10],"f":[2,3],"sf":[1]},{"i":527,"p":[1,2,3,4,5,6,7,8,9,10]},{"i":528,"p":[1,2,3,4,9,10],"sp":[1,2],"l":[7],"f":[1,3]},{"i":530,"p":[1,2,3,4,5,6,7,9,10],"fp":[2,3,4,5,6,7,9,10],"f":[1,2],"sf":[1]},{"i":531,"p":[1,2,3,4,7,8],"sp":[1,2],"f":[1,2,3],"sf":[1]},{"i":534,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8,9,10],"sp":[1],"f":[3],"sf":[1]},{"i":535,"p":[1,2,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2]},{"i":536,"p":[1,7,8,9],"f":[1,2,3]},{"i":539,"p":[1,2,3,4,7],"sp":[1,2],"f":[3]},{"i":541,"p":[1],"fp":[2,3,4,7,9,10],"sp":[1,2],"l":[2,3,4,7,9,10],"f":[1,2,3]},{"i":543,"p":[1,3,4,5,6],"sp":[1,2],"l":[2,7,8],"f":[2,3],"sf":[1]},{"i":544,"p":[7],"f":[1,2,3],"sf":[1,2]},{"i":545,"p":[1,3,4,5,6,9],"fp":[2,7,8],"sp":[1,2],"l":[2,7,8,10],"f":[3],"sf":[1,2]},{"i":546,"p":[1,3,7],"f":[1,2,3],"sf":[1,2]},{"i":547,"p":[1,2,3,4,7],"sp":[1,2]},{"i":549,"p":[1,2,3,4,6]},{"i":550,"p":[1,2],"fp":[3,9,10],"sp":[2],"l":[3,9,10],"sf":[1]},{"i":553,"p":[1,2,3,4,7,9],"sp":[1,2],"f":[1,2],"sf":[1]},{"i":554,"p":[1],"fp":[3,7,9],"sp":[1],"l":[3,7,9],"f":[1],"sf":[1,2]},{"i":556,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"sf":[1]},{"i":559,"p":[1,2,3,4],"fp":[7,9,10],"sp":[1,2],"l":[7,9,10],"sf":[1]},{"i":561,"p":[1,2,3,4,9,10],"f":[2,3],"sf":[2]},{"i":565,"p":[1,10],"sp":[1],"f":[1,2,3]},{"i":568,"p":[1,2,3,4,7,8,9,10],"f":[1,2,3],"sf":[1,2]},{"i":569,"p":[1,7,8,9,10],"fp":[7,8,9,10],"f":[1],"sf":[1]},{"i":570,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2,3]},{"i":571,"p":[1,2,4,7,10],"fp":[2,4,7,10],"sp":[1,2],"f":[3]},{"i":572,"sp":[1,2],"f":[1,3],"sf":[2]},{"i":573,"p":[1,3,4],"sp":[1,2],"l":[2,5,6,7,8,9,10],"f":[2]},{"i":574,"p":[1,7,8,9,10],"sp":[1,2],"f":[1]},{"i":577,"p":[1,2,3,4,6,9],"fp":[2,3,4,5,6,7,8,9],"l":[5,7,8],"f":[1,2,3]},{"i":578,"p":[1],"sp":[1,2],"l":[2,3,4,7,8]},{"i":579,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[3]},{"i":580,"p":[1],"fp":[2,3,4,7,8,9,10],"sp":[1,2],"l":[2,3,4,7,8,9,10],"f":[1,2,3],"sf":[1]},{"i":581,"sp":[1],"l":[2,3,4,5,6,7,8,9,10],"f":[2],"sf":[1]},{"i":584,"p":[1,7,10],"fp":[7,10],"sp":[2],"f":[3],"sf":[2]},{"i":587,"p":[2,7,10],"fp":[2,7,10],"sp":[1,2]},{"i":590,"p":[1],"fp":[6,8,10],"sp":[2],"l":[6,8,10]},{"i":591,"p":[1,2,4,7],"sp":[2]},{"i":593,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8,9,10],"f":[1,2,3]},{"i":596,"p":[1,2,3,4,5,6,9,10],"fp":[7,8],"sp":[1,2],"l":[7,8],"sf":[1]},{"i":597,"p":[1,7]},{"i":598,"p":[1],"sp":[1,2],"l":[2,7,9],"sf":[1]},{"i":599,"sp":[1],"sf":[1]},{"i":601,"p":[1,2],"sp":[2]},{"i":602,"p":[1,2,3,4,7,8,9,10],"fp":[2,7,8,10],"sp":[1,2],"f":[1,2,3],"sf":[1]},{"i":606,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8,9,10],"sp":[1,2]},{"i":607,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[2,3],"sf":[1]},{"i":609,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2,3],"sf":[1,2]},{"i":610,"p":[1,3,4,9],"fp":[2,5,6],"sp":[1,2],"l":[2,5,6,7,8,10],"f":[2,3],"sf":[1]},{"i":612,"fp":[7],"sp":[1,2],"l":[7]},{"i":613,"p":[1],"fp":[2],"sp":[1,2],"l":[2,7,10]},{"i":614,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[3],"sf":[2]},{"i":615,"p":[1,2],"sp":[1,2]},{"i":617,"p":[1,2,7,8],"sf":[1]},{"i":618,"p":[1,2,3,4,9,10],"sp":[1,2],"f":[1,2],"sf":[1]},{"i":620,"sp":[1,2],"l":[2,3,4,5,6,7,8,9,10],"f":[2,3],"sf":[1]},{"i":621,"p":[1,3,4,5,6],"l":[2,7,8,9,10],"f":[2,3],"sf":[1,2]},{"i":624,"p":[1,9],"f":[1,2,3]},{"i":625,"p":[1,6,7,8,9],"f":[1]},{"i":626,"p":[1,7,9],"sf":[1]},{"i":628,"p":[1,2,4,7,10],"sp":[1,2],"f":[2],"sf":[1,2]},{"i":630,"p":[1],"fp":[2,3,4,7,10],"sp":[1,2],"l":[2,3,4,7,10],"f":[3]},{"i":631,"p":[1,2,3,4,5,6,7,8,9,10],"f":[1,2]},{"i":638,"p":[1,2,4,7],"sp":[2]},{"i":639,"p":[1,2,3,4,5,6,7,8,9,10],"sf":[2]},{"i":644,"p":[1,2,3,4,7,8,9,10],"fp":[2,3,4,7,8,9,10],"sp":[1,2],"f":[3]},{"i":645,"p":[1,2,3,4,5,6,9,10],"l":[7,8],"f":[1,2,3],"sf":[1,2]},{"i":646,"p":[9],"f":[1]},{"i":647,"p":[1,3,4],"fp":[2,7,10],"sp":[1,2],"l":[2,7,10],"f":[3]},{"i":648,"p":[1,3,5,6,7,8,9,10],"sp":[1],"f":[1,2,3],"sf":[1]},{"i":649,"p":[3,4],"f":[1]},{"i":650,"p":[1,2,3,4,5,6,7,9,10],"sp":[1,2],"sf":[1]},{"i":652,"p":[1,2,3,4,5,6,7,8,9,10],"f":[1,2,3],"sf":[1]},{"i":653,"p":[1,7,8,9,10],"f":[2,3]},{"i":654,"p":[1,2,3,4,5,6,7,8,9,10],"f":[1,2]},{"i":655,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,7,9],"sp":[1,2],"f":[1,2,3],"sf":[1,2]},{"i":656,"p":[1,2,3,4,5,6,9],"sp":[1,2],"l":[7,8,10]},{"i":657,"p":[1],"fp":[2,3,4],"sp":[1,2],"l":[2,3,4],"sf":[1,2]},{"i":658,"p":[1,2,3,4,7,8,9,10],"fp":[2,3,4,7,8,9,10],"sp":[2],"sf":[1]},{"i":659,"p":[1],"sp":[1],"l":[7,8,9],"f":[2],"sf":[2]},{"i":662,"p":[1,2,3,4,7,10],"f":[3],"sf":[1]},{"i":663,"p":[1,2,3,4,7,9],"fp":[2,7],"sp":[1,2],"f":[1,2,3],"sf":[1]},{"i":664,"p":[1,2,3,4],"sp":[1,2],"l":[7,10],"f":[1,2,3]},{"i":665,"p":[2,7,9,10],"fp":[2,7,9,10],"sp":[1,2],"f":[3],"sf":[1]},{"i":666,"p":[1,4],"fp":[2,7,8],"sp":[1,2],"l":[2,7,8],"f":[3]},{"i":667,"sp":[1,2],"l":[2,3,7,10],"f":[3],"sf":[1,2]},{"i":668,"p":[1,2,3,4,5,6,7,8,9,10],"f":[2],"sf":[1,2]},{"i":670,"p":[1,2,4,6,7,8,9,10],"f":[3]},{"i":671,"p":[1,3,4,5,6,7,8,9],"sp":[1,2],"l":[2,10],"f":[1,3]},{"i":672,"p":[1,2]},{"i":673,"p":[1,3,4,9,10],"sp":[1,2],"l":[2,7],"f":[3],"sf":[1,2]},{"i":674,"p":[7],"sp":[2]},{"i":675,"p":[2,3,4,7,9],"sp":[2],"f":[3]},{"i":676,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2],"sf":[1]},{"i":677,"p":[1,2,3,4,5,6],"fp":[2],"sp":[1,2],"l":[7,8,10]},{"i":678,"p":[2],"fp":[2],"sp":[1,2],"l":[7,10],"f":[3],"sf":[1]},{"i":681,"p":[1,9],"sf":[1]},{"i":682,"p":[1,2,3,4],"sp":[2],"l":[7],"f":[1,2,3],"sf":[1,2]},{"i":683,"p":[1,3,4,9],"f":[2,3],"sf":[1]},{"i":684,"p":[1],"fp":[7,8,10],"sp":[2],"l":[7,8,10]},{"i":685,"p":[1,2,3,4,5,6,7,8,9,10],"f":[1,2,3],"sf":[1,2]},{"i":686,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2,3]},{"i":687,"p":[1,2,3,4,5,6,7],"sp":[2]},{"i":688,"fp":[7]},{"i":690,"p":[1,2,3,4],"sf":[1]},{"i":691,"p":[2,3,4,5,6,7,8,9,10]},{"i":694,"p":[2,3,4,5,6,8,9,10],"sp":[2],"l":[7],"f":[1]},{"i":697,"p":[1,2,3,4,7,9,10],"sp":[2],"sf":[1]},{"i":699,"p":[1,2,4,9],"sp":[2],"l":[7,10],"f":[1]},{"i":702,"p":[1,2,7,8],"fp":[2,7,8],"sp":[1,2],"f":[3]},{"i":703,"p":[1,7,8,9,10],"sp":[1],"f":[2,3],"sf":[2]},{"i":706,"sp":[1,2],"l":[2],"sf":[1]},{"i":707,"p":[1,2,3,4,7,9,10],"sp":[1],"f":[1,2,3],"sf":[1,2]},{"i":708,"p":[2,3,4,5,6,7,8,9,10],"fp":[2,4,7,8,9,10],"sp":[1,2],"f":[2,3]},{"i":709,"p":[1,3,4,5,6],"fp":[2,3,4,5,6,7,8,9,10],"sp":[1,2],"l":[2,7,8,9,10],"f":[1,2,3]},{"i":711,"p":[3,10],"sf":[1]},{"i":712,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2,3],"sf":[1,2]},{"i":713,"p":[1,2,3,4,5,6,7,8,9],"fp":[2,7,8],"f":[3]},{"i":714,"p":[1],"fp":[7,8,9],"l":[7,8,9],"f":[3]},{"i":715,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[2,3]},{"i":716,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2,3],"sf":[1]},{"i":717,"p":[1,2,3,4,7,9,10],"sp":[1,2],"f":[2,3]},{"i":718,"p":[1,2,3,4,5,6,7,8,9,10],"f":[1,2,3]},{"i":719,"p":[1,2,3,4,7,9,10],"sp":[1,2],"f":[2,3],"sf":[1]},{"i":720,"p":[1,3,4],"fp":[2,10],"sp":[1,2],"l":[2,7,10],"f":[3]},{"i":721,"p":[1,2,3,4,5,7],"fp":[2,3,4,5,6,7,8],"sp":[1,2],"l":[6,8],"f":[1,3]},{"i":722,"p":[1,7,9],"sp":[1]},{"i":723,"p":[1,2,3,4,7,8],"f":[2]},{"i":724,"p":[1],"sp":[1,2],"l":[7]},{"i":725,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[2,3],"sf":[2]},{"i":726,"p":[1,9,10],"fp":[9,10],"f":[1,2,3]},{"i":727,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1]},{"i":728,"p":[1,3,4],"fp":[2,5,6,7,8,9,10],"sp":[1,2],"l":[2,5,6,7,8,9,10],"f":[1,2,3],"sf":[1]},{"i":729,"p":[1,2,3,4,5,6,7,8],"fp":[2,3,4,5,6,7,8],"sp":[1,2]},{"i":730,"p":[1,8]},{"i":731,"p":[2,4,6,7,8],"f":[2]},{"i":732,"p":[1,2,3,4,5,6,7,8,9,10],"f":[2]},{"i":733,"p":[1,2,4,7,9,10],"fp":[2,4,7,9,10],"sp":[1],"f":[1],"sf":[1]},{"i":734,"p":[1,7,8,9],"f":[1]},{"i":735,"p":[1,7],"f":[1]},{"i":736,"p":[1,2,3,4,5,6],"fp":[7,8,10],"sp":[1,2],"l":[7,8,10],"sf":[1]},{"i":737,"p":[1,2,7]},{"i":738,"p":[2,3,4,7]},{"i":739,"p":[1,2,3,4,5,6,7,8,9,10],"sf":[1]},{"i":740,"p":[1],"fp":[2,3,4,5,6,7,8,10],"sp":[1,2],"l":[2,3,4,5,6,7,8,10],"f":[1,2,3]},{"i":741,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[3,4],"sp":[1,2],"sf":[1]},{"i":742,"p":[1,2,3,5,6],"f":[2,3]},{"i":743,"p":[1,2,3,4,5,6,7,8,9,10],"f":[2,3],"sf":[1]},{"i":744,"p":[1,3,4,5,6],"fp":[3,4,5,6],"sp":[1,2],"l":[2,7,8],"f":[3]},{"i":745,"p":[1,3,4,7,9],"sp":[1,2],"f":[1,2,3],"sf":[1]},{"i":746,"sp":[1,2],"l":[2,7],"f":[1,3],"sf":[1]},{"i":747,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8,9,10],"f":[2,3],"sf":[1,2]},{"i":748,"p":[1,2,3,4,7,8,9],"fp":[2,3,4,7,8,9],"sp":[1,2],"f":[1,2],"sf":[1]},{"i":749,"p":[1,3,4,5,6],"fp":[7,8,9,10],"sp":[1,2],"l":[2,7,8,9,10]},{"i":750,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2,3],"sf":[1,2]},{"i":751,"fp":[2,7],"sp":[1,2],"l":[2,7]},{"i":753,"p":[1,2,3,4,7,9,10],"fp":[2,3,4,7,9,10],"sp":[1,2],"f":[3]},{"i":754,"p":[1],"sp":[1,2],"l":[2,6,8,10]},{"i":755,"p":[1,3,4],"fp":[2,5,6,7,9,10],"sp":[1,2],"l":[2,5,6,7,9,10],"f":[1,2]},{"i":756,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[3]},{"i":757,"p":[1,2,3,4,5,7,10],"sp":[1,2]},{"i":758,"p":[1,7,8,9],"f":[2]},{"i":759,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2,3]},{"i":760,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2,3],"sf":[2]},{"i":761,"p":[1,3,5,7,8,9],"f":[1]},{"i":762,"fp":[7,10],"sp":[1,2],"l":[7,10],"f":[3],"sf":[2]},{"i":763,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2,3],"sf":[1,2]},{"i":764,"p":[1,2,7,8,9,10],"sp":[1,2]},{"i":765,"p":[2,3,4,7,8,9,10],"sp":[1,2],"f":[2]},{"i":766,"p":[1,2],"fp":[2],"sf":[2]},{"i":767,"p":[1,2,3,4,7,9,10],"sp":[1,2],"f":[1,2,3],"sf":[1]},{"i":768,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2,3],"sf":[1,2]},{"i":769,"p":[1,8]},{"i":770,"p":[1,3,4,5,6],"sp":[1,2],"l":[2,7,8,9,10],"f":[3]},{"i":771,"p":[1,3,7,10],"sp":[2],"sf":[1]},{"i":772,"sp":[1]},{"i":773,"p":[1,2,3,4,7,9,10],"sp":[1,2],"f":[2,3],"sf":[1]},{"i":774,"fp":[2,7],"sp":[1,2],"l":[2,7]},{"i":775,"p":[1,2],"sp":[1,2],"f":[3]},{"i":776,"p":[2],"fp":[2]},{"i":777,"p":[1],"fp":[2,3,4,7],"sp":[1,2],"l":[2,3,4,7]},{"i":778,"p":[2,3,4,7],"f":[3]},{"i":779,"p":[1,2,7],"sp":[1,2],"f":[3],"sf":[1]},{"i":780,"p":[1,2,3,4,7,8],"sp":[2]},{"i":781,"p":[1,3,4,5,6,8,9],"fp":[2,7,10],"sp":[1,2],"l":[2,7,10],"f":[2,3],"sf":[1,2]},{"i":782,"p":[1,3,5,7,8,9,10]},{"i":783,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2,3],"sf":[1,2]},{"i":784,"p":[1],"sp":[1,2],"l":[2,7],"f":[3]},{"i":785,"p":[1,7,9],"sp":[1],"f":[2]},{"i":786,"p":[8]},{"i":787,"p":[1,7],"fp":[7],"sp":[1,2]},{"i":788,"p":[1,2,3,4,5,6,7,8,9,10],"f":[2],"sf":[1]},{"i":789,"p":[1,2,3,4,5,6,7,8,9,10],"f":[2],"sf":[1]},{"i":790,"p":[1,3,4],"sp":[1,2],"l":[2,7,9,10],"f":[1,2,3],"sf":[1]},{"i":791,"p":[1,2],"fp":[2],"sp":[2]},{"i":792,"p":[1],"fp":[3,7,10],"sp":[1],"l":[3,7,10],"f":[1,2]},{"i":793,"p":[1,2,3,4,7,9,10],"fp":[2,3,4,7,9,10],"sp":[1,2]},{"i":794,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[10],"sp":[1,2],"f":[1,2,3],"sf":[1,2]},{"i":795,"p":[1,2,3,4,7,9],"sp":[1,2],"f":[3],"sf":[1]},{"i":796,"p":[1,2,7,8],"fp":[2,7,8],"sp":[1,2],"f":[3]},{"i":797,"p":[1,7],"fp":[7],"sp":[1,2],"f":[2,3]},{"i":798,"p":[1,2,3,4,5,6,8,9,10],"fp":[2,3,4,5,6,7,8,9,10],"sp":[1,2],"l":[7],"f":[3],"sf":[2]},{"i":799,"sp":[1,2]},{"i":800,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[10],"sp":[1],"f":[2],"sf":[2]},{"i":801,"p":[1,4],"sp":[1,2],"l":[2,7],"f":[3]},{"i":802,"p":[1,3,4,7],"fp":[2,3,4,5,6,7,8,9,10],"sp":[1,2],"l":[2,5,6,8,9,10],"f":[1,2,3],"sf":[1,2]},{"i":803,"p":[1],"fp":[2,3,4,5,6,7,8,9,10],"sp":[1,2],"l":[2,3,4,5,6,7,8,9,10],"f":[1,2,3],"sf":[1,2]},{"i":804,"p":[1,3,4],"fp":[2,3,4,7,10],"sp":[1,2],"l":[2,7,10],"f":[1]},{"i":805,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"sf":[1,2]},{"i":806,"p":[3,4],"sp":[1,2],"l":[2,7,10],"f":[3]},{"i":807,"p":[1],"fp":[2,3,4,7,8,9,10],"sp":[1,2],"l":[2,3,4,7,8,9,10],"f":[3],"sf":[2]},{"i":808,"p":[1,2,3,4,7,9],"sp":[1,2],"f":[3]},{"i":809,"p":[1,2,3,4,7],"sp":[1,2]},{"i":810,"p":[1],"fp":[7],"sp":[1,2],"l":[7],"f":[3]},{"i":811,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"sf":[1,2]},{"i":812,"p":[1],"fp":[7,9,10],"sp":[1],"l":[7,9,10],"f":[1,2,3]},{"i":813,"p":[1,7,8,9,10],"fp":[7,8,9,10],"sp":[1],"f":[2,3],"sf":[2]},{"i":814,"p":[1,3,4],"fp":[2,7,10],"sp":[1,2],"l":[2,7,10],"f":[1,2],"sf":[1]},{"i":815,"p":[1,2,3,4,6,7,9,10],"sp":[1,2]},{"i":816,"p":[1,2,3,5,10],"sp":[2]},{"i":817,"p":[1,2,3,4,5,6,7,8,9,10],"f":[2]},{"i":818,"p":[1,2,4,7,10]},{"i":819,"p":[1],"fp":[7],"sp":[1],"l":[7]},{"i":820,"p":[1,3,5,6,8,10],"fp":[10],"f":[1,2]},{"i":821,"p":[1,7,10],"fp":[7,10],"sp":[1,2]},{"i":822,"p":[1,2,3,4,7,9,10],"fp":[7],"sp":[2]},{"i":823,"p":[1,7,8,9],"fp":[7,8,9],"sp":[1,2]},{"i":824,"p":[1,2,3,4,5,6,7,8,10],"sp":[1,2],"f":[2,3],"sf":[2]},{"i":825,"p":[1],"fp":[2,3,4,5,6,7,8,9,10],"sp":[1,2],"l":[2,3,4,5,6,7,8,9,10],"f":[2,3]},{"i":826,"p":[7,8],"sp":[1,2]},{"i":827,"p":[1,7,8],"fp":[7,8],"f":[2]},{"i":828,"p":[1],"fp":[3,5,6,8,9,10],"sp":[1,2],"l":[3,5,6,8,9,10],"f":[1,2,3],"sf":[1]},{"i":829,"p":[1,2,3,4,5,6,7,8,9],"f":[2]},{"i":830,"fp":[2,3,4,5,6,7,8,9,10],"sp":[1,2],"l":[2,3,4,5,6,7,8,9,10],"f":[1,2,3],"sf":[1]},{"i":831,"p":[1,2,3,4,7,8,9,10],"fp":[2,7,8,9,10],"sp":[1,2],"f":[1,2]},{"i":832,"p":[1,7]},{"i":833,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[3],"sf":[2]},{"i":834,"p":[1,2,3,4,5,6,7,8],"f":[3],"sf":[2]},{"i":835,"p":[1,2,3,4,7,9],"sp":[1,2],"f":[3]},{"i":836,"p":[1],"fp":[7,8],"l":[7,8,10],"sf":[1]},{"i":837,"p":[1,2,5,6],"fp":[5,6],"l":[7,8]},{"i":838,"sp":[1,2],"l":[2,7]},{"i":839,"p":[1,2,3,7,8],"sp":[1]},{"i":840,"p":[1,3,4],"fp":[2,7,9,10],"sp":[1,2],"l":[2,7,9,10],"f":[3]},{"i":841,"fp":[7,8,10],"sp":[1,2],"l":[7,8,10]},{"i":842,"p":[1],"sp":[1,2],"l":[2,7,8,9,10]},{"i":843,"p":[1],"fp":[7,8],"l":[7,8],"f":[1,2,3],"sf":[1]},{"i":844,"p":[1,2,3,4,7],"fp":[2,3,4,7],"sp":[2],"sf":[1]},{"i":845,"sp":[1],"l":[7],"f":[1]},{"i":846,"p":[1,2,3,4,7,10],"fp":[2,3,4,7,10],"sp":[1,2],"sf":[1]},{"i":847,"p":[2,5,6,7,8,9,10]},{"i":848,"p":[1,2,3,4,7,9,10],"sp":[1,2]},{"i":849,"p":[1,2,3,4,7]},{"i":850,"p":[1],"sp":[2],"l":[10]},{"i":851,"p":[1],"sp":[1,2],"l":[2,7,8,10]},{"i":852,"p":[1,7],"sp":[1],"f":[3]},{"i":853,"fp":[7,8],"sp":[1],"l":[7,8],"sf":[1]},{"i":854,"p":[2,7,8],"sp":[1,2]},{"i":855,"p":[1,2,3,4,7],"fp":[2,7],"sp":[1,2],"f":[3],"sf":[1]},{"i":856,"p":[1,3,4],"fp":[2,7,9,10],"sp":[1,2],"l":[2,7,9,10]},{"i":857,"p":[1,3,4],"fp":[2,10],"sp":[1,2],"l":[2,10],"f":[1,2,3]},{"i":858,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2,3]},{"i":859,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8,9,10],"f":[1,2,3],"sf":[1,2]},{"i":860,"p":[1,2,10],"f":[3],"sf":[1]},{"i":861,"p":[1,2,3,4,5,6,7,8,9,10],"f":[1,2,3],"sf":[2]},{"i":862,"p":[1,2,3,4,6,8],"fp":[2],"sp":[1,2],"l":[5,7,10]},{"i":863,"p":[1,7,8,9],"f":[2,3]},{"i":864,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[7,8,9,10],"f":[1,2,3]},{"i":865,"p":[1,2,7,8],"sp":[1,2],"f":[3]},{"i":866,"p":[1,2,4,7],"sp":[2]},{"i":867,"p":[1,2,3,4],"fp":[2,3,4,7,10],"sp":[1,2],"l":[7,10],"f":[3],"sf":[2]},{"i":868,"p":[1,2,3,4,5,6,7,8,9],"f":[3]},{"i":869,"p":[2],"fp":[2],"sp":[1,2],"f":[3]},{"i":870,"p":[1],"f":[3],"sf":[2]},{"i":871,"p":[1,7],"fp":[7],"sp":[1,2],"f":[2,3]},{"i":872,"sp":[2],"l":[2,7]},{"i":873,"l":[7]},{"i":874,"p":[1],"sp":[1,2],"l":[2,3,4,5,6,7,8]},{"i":875,"p":[2,4,6,7,8,9,10],"fp":[2,4,6,7,8,9,10],"f":[1]},{"i":876,"p":[1,6],"sp":[1,2],"l":[7,8]},{"i":877,"p":[3,5,10],"f":[1,2,3]},{"i":878,"p":[1],"sp":[1,2],"l":[2,7,8],"f":[3]},{"i":879,"p":[1,3,4],"fp":[2,7,9,10],"sp":[1,2],"l":[2,5,6,7,9,10],"f":[1,2,3],"sf":[2]},{"i":880,"p":[1,2,3,4,5,6,7,8,9,10],"f":[1,2],"sf":[1]},{"i":881,"p":[1,2,7,8,10],"sp":[2]},{"i":882,"p":[1,3,10],"fp":[3,5],"sp":[1],"l":[5,9],"f":[3],"sf":[1]},{"i":883,"sp":[1,2]},{"i":884,"p":[1,5,6,7,8,9,10],"sp":[1,2],"l":[2,3,4],"f":[1,2,3],"sf":[1,2]},{"i":885,"p":[1,3,4,5,6,8,9],"fp":[2,7,10],"sp":[1,2],"l":[2,7,10],"f":[3],"sf":[1,2]},{"i":886,"p":[1,2,4,7],"sp":[2]},{"i":887,"p":[1],"sf":[1]},{"i":888,"p":[1,2,4,7,9,10],"f":[3],"sf":[1]},{"i":889,"p":[1,8,9]},{"i":890,"p":[1,8]},{"i":891,"p":[1,2,3,4,7],"sp":[1,2]},{"i":892,"p":[10],"sp":[1],"sf":[1,2]},{"i":893,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[2,3],"sf":[2]},{"i":894,"p":[2,3,4,5,6,7,8,9,10]},{"i":895,"p":[1,2,3,4,7,9,10],"fp":[3,4,7,9,10],"sp":[1,2],"f":[3],"sf":[1]},{"i":896,"p":[1],"fp":[8,9],"sp":[1],"l":[8,9],"f":[3],"sf":[2]},{"i":897,"p":[1,8,10],"sp":[1],"f":[1,2,3],"sf":[1,2]},{"i":898,"fp":[2,10],"sp":[2],"l":[2,10]},{"i":899,"p":[1],"sp":[1]},{"i":900,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2]},{"i":901,"p":[1,2,3,4,5,6,7,8,9,10],"f":[1,2,3],"sf":[1,2]},{"i":902,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[3],"sf":[1,2]},{"i":903,"p":[9],"f":[3],"sf":[1]},{"i":904,"p":[1],"fp":[2,7,8],"sp":[1,2],"l":[2,7,8,10],"f":[3]},{"i":905,"p":[1,2],"fp":[2],"sp":[1,2],"l":[3,4,5,6,7,8,9,10],"f":[1,3],"sf":[1]},{"i":906,"p":[3,5]},{"i":907,"p":[1],"fp":[7],"sp":[2],"l":[7],"f":[2,3]},{"i":908,"p":[1,2,3,4,7,8,9,10],"sp":[1,2],"f":[2,3],"sf":[1,2]},{"i":909,"p":[9,10],"sp":[1,2],"f":[1]},{"i":910,"p":[1,2,3,4,5,6,7,8,10],"fp":[2,5,6,7,8,10],"sp":[1,2],"f":[3]},{"i":911,"sp":[1],"l":[7],"sf":[2]},{"i":912,"p":[2],"sp":[1,2],"l":[7]},{"i":913,"p":[1],"fp":[2],"sp":[1,2],"l":[2],"f":[3],"sf":[2]},{"i":914,"p":[1],"fp":[2,3,4,5,6,7,8],"l":[2,3,4,5,6,7,8]},{"i":915,"p":[1,3,4],"fp":[2,7,10],"sp":[2],"l":[2,7,10],"f":[3]},{"i":916,"fp":[2,3,4,5,6,7,8,10],"sp":[1,2],"l":[2,3,4,5,6,7,8,10],"f":[1,3]},{"i":917,"p":[1,3,4,9],"fp":[2,3,4,7,9],"sp":[1,2],"l":[2,7]},{"i":918,"p":[1,2,3,4,5,6,7,8,9],"fp":[7,8,9],"sp":[1,2],"l":[10]},{"i":919,"p":[1],"fp":[2,7,10],"sp":[1,2],"l":[2,7,10]},{"i":920,"p":[1,2,3,4,5,6,7,8,9,10],"f":[1,2]},{"i":921,"p":[2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[3]},{"i":922,"p":[1,2,3,4,7],"sp":[2],"f":[3],"sf":[2]},{"i":923,"l":[7]},{"i":924,"p":[1,2,3,4,7],"sp":[2]},{"i":925,"l":[7],"f":[2]},{"i":926,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[2,3]},{"i":927,"l":[7,8]},{"i":928,"p":[1]},{"i":929,"p":[1,2,3,4,7,10],"sp":[2]},{"i":930,"p":[1,2,3,4,7],"sp":[1,2],"f":[1,3],"sf":[1]},{"i":931,"p":[1,8],"sp":[2]},{"i":932,"p":[1,3,4],"fp":[3,4],"sp":[1,2],"l":[2,7,9],"f":[3],"sf":[1]},{"i":933,"p":[7,8,10]},{"i":934,"p":[1,7,8]},{"i":935,"p":[1,3,4,5,6,7,8,10],"fp":[7,8],"sp":[1,2]},{"i":936,"p":[1,3,4,5],"f":[1]},{"i":937,"p":[1,2,3,4,7,8,9,10],"fp":[7,8],"sp":[1,2],"f":[3],"sf":[1]},{"i":938,"p":[1,2,3,4,7,8,9,10],"fp":[2,7,8],"sp":[1,2],"f":[1,3],"sf":[1]},{"i":939,"p":[1,7,8,9,10],"f":[2,3],"sf":[1]},{"i":940,"p":[1],"sp":[2],"l":[5,6,7,9],"f":[1]},{"i":941,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2]},{"i":942,"p":[1,2,3,4,5,6,7,8,9,10]},{"i":943,"p":[1,5,6,7,8,9,10],"sp":[2],"f":[2]},{"i":944,"p":[1,3,4,5,6],"sp":[1,2],"l":[2,7,8,9,10],"f":[3]},{"i":945,"sp":[2],"f":[3]},{"i":946,"p":[1,7],"fp":[7],"sp":[1,2],"f":[2,3]},{"i":947,"p":[1,2,3,4],"sp":[1,2],"l":[7]},{"i":948,"p":[1,2,3,4,7,10],"sp":[1,2]},{"i":949,"fp":[8,9,10],"l":[7,8,9,10]},{"i":950,"sp":[2]},{"i":951,"p":[2,7],"fp":[2,7],"sp":[1,2]},{"i":952,"p":[1,3,4,7,10],"f":[2,3],"sf":[1]},{"i":953,"sp":[2]},{"i":954,"p":[1,2,7],"sp":[1,2]},{"i":955,"p":[1,2,3,4,5,6,7,8,9,10],"f":[1,2,3]},{"i":956,"p":[1],"sp":[1]},{"i":957,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[3],"sf":[1]},{"i":958,"p":[1,7,8,10]},{"i":959,"p":[1,2,3,4,5,10],"sp":[1],"f":[2],"sf":[1]},{"i":960,"sp":[1,2],"l":[2,7]},{"i":961,"sp":[1,2],"f":[2],"sf":[1]},{"i":962,"p":[1,2,3,4,5,6,7],"sp":[1,2]},{"i":963,"p":[1,2,3,4,5,6,7,8,9,10],"f":[3],"sf":[1,2]},{"i":964,"p":[2,4,7,8,9,10],"sp":[1,2],"f":[3],"sf":[2]},{"i":965,"p":[1],"fp":[10],"l":[10]},{"i":966,"p":[7]},{"i":967,"p":[1,3,4,9],"fp":[2,7,8,10],"sp":[1,2],"l":[2,7,8,10],"f":[1,2,3]},{"i":968,"p":[1,3,4,7,10],"sp":[1,2],"f":[2,3]},{"i":969,"sp":[1,2],"l":[2,7,8],"f":[3]},{"i":970,"p":[1],"sp":[1,2],"l":[2,7,8,9,10],"f":[1,3],"sf":[2]},{"i":971,"p":[1,2,3,4,7]},{"i":972,"p":[1,2,3,4,7,10],"sp":[1,2],"f":[2]},{"i":973,"p":[1,2,4,7,9,10],"sp":[1],"f":[3],"sf":[1,2]},{"i":974,"p":[2,3,4,7,8,10],"sp":[1,2],"f":[1,3],"sf":[1]},{"i":975,"p":[1,8,10],"sp":[1,2],"f":[3],"sf":[1]},{"i":976,"p":[1,2,3,4,5,6,7,8,9,10],"f":[1,3],"sf":[1]},{"i":977,"p":[9],"sp":[1],"l":[8]},{"i":978,"p":[1,2,3,4,7],"sf":[1]},{"i":979,"p":[1,2,3,4,5,6,7,8,9,10],"f":[1,2,3],"sf":[1]},{"i":980,"p":[1,2,4,5,6,7,8,9,10],"sf":[1]},{"i":981,"p":[1,9],"fp":[7],"l":[7],"f":[1,2]},{"i":982,"p":[1,2,3,4,5,6,7,8,9,10]},{"i":983,"p":[1,2,3,4,5,6,7,8,9,10]},{"i":984,"p":[1,2,3,4,5,6,7,8,9,10],"f":[1,2,3],"sf":[2]},{"i":985,"p":[7,9],"f":[1,2,3]},{"i":986,"p":[1,3,4],"fp":[2,7,9,10],"sp":[1,2],"l":[2,7,9,10],"f":[1,2,3]},{"i":987,"p":[1,2,3,4,7],"f":[1,3],"sf":[1]},{"i":988,"p":[1,5,6,8,9,10]},{"i":989,"p":[1],"sp":[1,2],"l":[2,3,4,7,8,10],"f":[3]},{"i":990,"p":[2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2,3],"sf":[1,2]},{"i":991,"p":[1,2,3,4,7],"sp":[2],"f":[2,3],"sf":[2]},{"i":992,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1],"sf":[1]},{"i":993,"p":[1,2,3,7,8,10]},{"i":994,"p":[3,4,5,6,9],"fp":[9],"sp":[1,2],"l":[7,8,10],"f":[1,3]},{"i":995,"p":[1,2,4,7],"sp":[1,2]},{"i":996,"p":[1,3,4,5,6,7,8,10],"sp":[1,2],"l":[2]},{"i":997,"p":[1,3,4],"sp":[1,2],"l":[2,7],"f":[3]},{"i":998,"p":[1,2,3,4,7],"f":[3]},{"i":999,"p":[1,2,3,4,5,6,7,8,9,10]},{"i":1000,"p":[1,7,8],"f":[3],"sf":[2]},{"i":1001,"p":[1,2,3,4,5,6,7,8,9,10],"f":[1],"sf":[1]},{"i":1002,"p":[1,2,7,10],"fp":[7,10],"f":[2]},{"i":1003,"p":[1],"fp":[7],"sp":[1,2],"l":[7]},{"i":1004,"p":[1],"sp":[1,2],"l":[2,4,5,6,7,8,9,10],"f":[2,3],"sf":[1,2]},{"i":1005,"sp":[1,2],"l":[7]},{"i":1006,"p":[1,7]},{"i":1007,"p":[1,2,3,4,5,6],"f":[1]},{"i":1008,"fp":[3,4,5,6,7,8,9,10],"l":[3,4,5,6,7,8,9,10],"f":[1]},{"i":1009,"p":[1,2,4,7],"f":[3]},{"i":1010,"p":[2,3,4,5,7,10],"sp":[1,2],"f":[3],"sf":[1]},{"i":1011,"p":[1,2,7],"sp":[1,2],"f":[3],"sf":[1]},{"i":1012,"p":[1,2,3,4,5,6,7,8,9,10]},{"i":1013,"l":[7]},{"i":1014,"sp":[1,2],"l":[7,8,10]},{"i":1015,"p":[1,3,4],"sp":[1,2],"l":[2,7,9,10],"f":[1,2,3],"sf":[1]},{"i":1016,"p":[1,2,3,4,5,6,7,8,10],"fp":[2],"sp":[1,2]},{"i":1017,"p":[1,2,4,6,7,8,10]},{"i":1018,"p":[3,9],"fp":[3,9]},{"i":1019,"p":[7,10],"f":[1]},{"i":1020,"p":[1,2,3,4,5,6,7,8,9,10],"f":[1,2,3]},{"i":1021,"p":[1,2,3,4,7],"sp":[1,2],"l":[5,6,8,9,10],"f":[1,2,3],"sf":[1,2]},{"i":1022,"p":[1,2,3,4,10],"fp":[2,3,4,10],"sp":[1,2],"f":[3],"sf":[1]},{"i":1023,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8,9,10],"sf":[2]},{"i":1024,"p":[1,2,3,4,5,6,7,8,9,10],"f":[1,2],"sf":[1,2]},{"i":1025,"p":[1,3,5],"fp":[7,9],"l":[7,9],"f":[1,3]},{"i":1026,"p":[1,2,7],"fp":[2,7],"sp":[1,2]},{"i":1027,"p":[1,2,3,4,5,7,10]},{"i":1028,"p":[1,3,4,5,6,7,8,9,10],"sp":[1,2],"l":[2],"f":[2,3],"sf":[1]},{"i":1029,"p":[2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8,9,10]},{"i":1030,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8],"sp":[2],"f":[3]},{"i":1031,"p":[1,2,3,4,7,9],"f":[2]},{"i":1032,"p":[1,2,3,4,5,6,7,8,9,10]},{"i":1033,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,3]},{"i":1034,"p":[1,2,3,4,5,6,7,8,10],"fp":[2,3,4,5,6,7,8,10],"f":[1,2,3],"sf":[1,2]},{"i":1035,"p":[1,2,3,4,7,9,10],"f":[2]},{"i":1036,"p":[1,3,4,7,9],"sp":[1,2],"l":[2,10],"f":[3],"sf":[1]},{"i":1037,"p":[7,8],"f":[3]},{"i":1038,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8,9,10],"f":[3]},{"i":1039,"p":[2,3,4],"fp":[9],"sp":[1,2],"l":[5,7,8,9,10],"sf":[1]},{"i":1040,"p":[1,3,4,7,8,9,10],"f":[1,2]},{"i":1041,"sp":[1,2],"l":[2,7,9],"f":[3]},{"i":1042,"p":[1,2,3,4,5,10],"fp":[4,5,7,8,9],"l":[7,8,9]},{"i":1043,"p":[1],"sp":[1,2],"l":[2,10]},{"i":1044,"sp":[1],"l":[7]},{"i":1045,"p":[1,3,4,5,6,7,8,9,10],"sf":[1]},{"i":1046,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2,3],"sf":[1,2]},{"i":1047,"p":[1,2,4,6,7,8,9,10],"fp":[2,7],"sf":[1]},{"i":1048,"p":[1,3,4],"sp":[1,2],"l":[2,7,8,9,10],"f":[3]},{"i":1049,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2,3],"sf":[1]},{"i":1050,"p":[1,2,4],"fp":[2,7],"sp":[1],"l":[7],"f":[2],"sf":[1]},{"i":1051,"p":[1],"sp":[1],"l":[5,6,7,8,10],"f":[2,3]},{"i":1052,"p":[1,2,3,4,5,6,7,8,9,10],"f":[1,2,3],"sf":[1,2]},{"i":1053,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2,3],"sf":[1,2]},{"i":1054,"fp":[7],"l":[7]},{"i":1055,"p":[1,7],"sp":[2],"f":[1,2,3]},{"i":1056,"p":[1,2,3,4,7],"sp":[1,2],"sf":[1]},{"i":1057,"p":[1],"fp":[2,9,10],"sp":[1,2],"l":[2,9,10]},{"i":1058,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"sf":[1]},{"i":1059,"p":[7,8,9,10],"fp":[7,8,9,10],"f":[1,2]},{"i":1060,"p":[1,2,3,4,7,8],"sp":[2],"f":[1]},{"i":1061,"p":[1,7,8,9]},{"i":1062,"p":[1,2,3,4,7,9,10],"f":[1,2,3]},{"i":1063,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2,3]},{"i":1064,"p":[1],"fp":[8],"l":[8]},{"i":1065,"sp":[1],"f":[1],"sf":[1]},{"i":1066,"p":[1,3,4],"sp":[1,2],"l":[2,7,10],"f":[2,3],"sf":[1]},{"i":1067,"p":[1,3,4],"fp":[3,4],"sp":[1,2],"l":[2,7,8,10]},{"i":1068,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2,3],"sf":[1]},{"i":1069,"p":[1,7,8,10],"fp":[7,8,10],"sp":[2]},{"i":1070,"p":[1],"fp":[2],"sp":[1,2],"l":[2],"f":[3],"sf":[2]},{"i":1071,"p":[1,3,4],"fp":[2,5,6,7,8,9,10],"sp":[1,2],"l":[2,5,6,7,8,9,10],"f":[1,2,3],"sf":[1]},{"i":1072,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2,3],"sf":[1,2]},{"i":1073,"p":[1,2,3,4,7],"f":[3]},{"i":1074,"p":[1,3,4,5,6,7,8,9,10],"f":[3],"sf":[1]},{"i":1075,"p":[8,9],"fp":[10],"sp":[1,2],"l":[10],"f":[1]},{"i":1076,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[3],"sf":[2]},{"i":1077,"p":[2,3,4,5,6,10],"fp":[5,6,9],"sp":[1,2],"l":[9],"f":[1,2,3],"sf":[1,2]},{"i":1078,"p":[1,4,6,10],"fp":[10],"f":[1],"sf":[1]},{"i":1079,"p":[2],"fp":[2],"sp":[1,2],"f":[3],"sf":[1]},{"i":1080,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,5,6,7,8,10],"sp":[1,2],"f":[2],"sf":[2]},{"i":1081,"p":[1,4,10],"fp":[2,4,7,10],"sp":[1,2],"l":[2,7]},{"i":1082,"p":[1,2,3,4,5,6,9],"fp":[2,3,4,5,6,7,8,9,10],"sp":[1,2],"l":[7,8,10],"f":[3]},{"i":1083,"p":[2],"fp":[2],"sp":[1,2],"f":[3]},{"i":1084,"p":[1,3,4],"sp":[1,2],"l":[2,7],"f":[3]},{"i":1085,"p":[1,3,4,5,6],"fp":[2,7,8,9,10],"sp":[1,2],"l":[2,7,8,9,10],"f":[3]},{"i":1086,"p":[1],"sp":[1,2],"l":[2,3,4,7,9,10],"f":[1,2,3],"sf":[1,2]},{"i":1087,"p":[1,3,4,5,6,7,8,9,10],"fp":[2],"sp":[1,2],"l":[2],"f":[1,2,3],"sf":[1,2]},{"i":1088,"p":[1],"fp":[10],"sp":[2],"l":[10]},{"i":1089,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1],"f":[1,2,3]},{"i":1090,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[3]},{"i":1091,"p":[1,3,4,7,9,10],"fp":[2],"sp":[2],"l":[2],"f":[1,2,3],"sf":[1]},{"i":1092,"p":[1,2,3,4,5,6,7,9,10],"sp":[1,2],"sf":[1]},{"i":1093,"p":[2,7]},{"i":1094,"p":[1],"sp":[1,2]},{"i":1095,"p":[1,2,3,4,7,9,10],"f":[1,2,3]},{"i":1096,"p":[1,2,3,4,7,9,10],"f":[1,2,3]},{"i":1097,"p":[1,2,3,4,5,6,7,8,10],"fp":[2,7,8,10],"sp":[1,2],"sf":[1]},{"i":1098,"p":[2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[3],"sf":[1,2]},{"i":1099,"p":[1],"sf":[1]},{"i":1100,"p":[1]},{"i":1101,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2,3],"sf":[1]},{"i":1102,"p":[1,2,3,4,5,6],"sp":[1,2],"l":[7,8,10],"f":[3]},{"i":1103,"p":[1,2,3,5,10],"f":[1,2],"sf":[1]},{"i":1104,"p":[1,2,8,9],"fp":[8,9]},{"i":1105,"p":[1,2,3,4,5,6,7,8,10],"sp":[1,2],"f":[3],"sf":[1]},{"i":1106,"p":[1,3,4],"fp":[2,7,10],"sp":[1,2],"l":[2,7,10]},{"i":1107,"p":[1,3,4,5,6,9],"sp":[2],"l":[2,7,8,10],"f":[2],"sf":[2]},{"i":1108,"p":[7]},{"i":1109,"p":[1,2,3,4,7],"fp":[2,3,4,7],"f":[1,2,3]},{"i":1110,"p":[1,2,3,4,7,10],"sp":[2],"f":[1,2,3],"sf":[1]},{"i":1111,"p":[7]},{"i":1112,"p":[1]},{"i":1113,"p":[1,2,4,7],"fp":[2,4,7,9],"sp":[1,2],"l":[8,9,10],"f":[3],"sf":[1,2]},{"i":1114,"p":[1,7]},{"i":1115,"p":[1],"sp":[1],"f":[3]},{"i":1116,"p":[1,3,4,7,9]},{"i":1117,"p":[1,2,3,4,7,8,9,10],"sp":[1,2]},{"i":1118,"p":[1,2,3,4,5,6,9,10],"fp":[2,3,4,5,6,9,10],"sp":[1,2],"l":[7,8],"f":[3],"sf":[1]},{"i":1119,"p":[3,4,7,9],"f":[2]},{"i":1120,"p":[1,3,4,5,6,7,8,9,10],"sp":[1,2],"l":[2],"f":[2,3],"sf":[1]},{"i":1121,"p":[1,2,3,4,6,8],"sp":[2],"f":[1,2]},{"i":1122,"p":[1,7,8,9],"sp":[1],"f":[2]},{"i":1123,"p":[1,2,3,4,5,6,7,8,9,10],"f":[1,2,3],"sf":[1,2]},{"i":1124,"p":[1,2,3,4,7,9],"f":[1,2,3]},{"i":1125,"p":[1,2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[3]},{"i":1126,"p":[1,2,3,4,7,9,10],"fp":[2,7,9,10],"sp":[1,2],"f":[1,2,3]},{"i":1127,"p":[1,3,5,7,8,10],"f":[2,3]},{"i":1128,"p":[1,2,3,4,7]},{"i":1129,"sp":[1,2],"l":[7,8]},{"i":1130,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[3]},{"i":1131,"p":[1,2,3,4,7,9],"sp":[1,2],"l":[10],"f":[3],"sf":[2]},{"i":1132,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8,9,10]},{"i":1133,"p":[2,7,10],"sp":[1,2],"f":[3]},{"i":1134,"p":[1,2,7,10],"sp":[1,2],"f":[3]},{"i":1135,"p":[1,2,3,4,5,6],"fp":[2,3,4,5,6],"sp":[1,2],"l":[7,8]},{"i":1136,"p":[1,2,3,4,7,8,10],"sp":[1,2],"f":[2,3],"sf":[1]},{"i":1137,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8,9,10],"sp":[1,2],"f":[1,2,3],"sf":[1,2]},{"i":1138,"p":[1,2,3,4,5,6,7,8,9],"sp":[1,2],"l":[10],"f":[1,2,3],"sf":[2]},{"i":1139,"p":[1,5,6,8,10],"sp":[2]},{"i":1140,"p":[1],"sp":[2],"l":[2,4,7,8,10],"sf":[1]},{"i":1141,"p":[1,5,6,9,10],"fp":[5,6,9,10],"f":[3],"sf":[2]},{"i":1142,"fp":[7,10],"sp":[1],"l":[7,10]},{"i":1143,"p":[1,2,7,10],"sp":[2]},{"i":1144,"p":[1,2,3,4,7,8,9,10],"f":[1,2,3]},{"i":1145,"p":[1,2,3,4,7,8],"sp":[2]},{"i":1146,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,4,5,6,7,8,9,10],"f":[1,2,3]},{"i":1147,"p":[1,2,3,4,5,7],"sp":[1,2],"l":[10],"f":[3],"sf":[1,2]},{"i":1148,"p":[1,2,3,4,5,6,7,8,9,10],"fp":[2,3,5,7,8],"sp":[1,2],"f":[1,2]},{"i":1149,"fp":[2,7,8],"sp":[1,2],"l":[2,7,8],"f":[3]},{"i":1150,"p":[1,2,3,4,7,10],"fp":[7],"sp":[1,2],"f":[1,2,3]},{"i":1151,"p":[1],"fp":[2,3,4,5,6,7,8,9,10],"sp":[1,2],"l":[2,3,4,5,6,7,8,9,10],"f":[3],"sf":[1]},{"i":1152,"p":[1],"l":[7,8,9],"sf":[2]}],"st":[{"i":1,"p":[],"sf":[1,2]},{"i":2,"p":[2,7],"sf":[]},{"i":3,"p":[2,3,4],"sf":[]},{"i":4,"p":[2,7,9],"sf":[]},{"i":5,"p":[2,3,7],"sf":[]},{"i":6,"p":[2,4,7],"sf":[]},{"i":7,"p":[2,4,7,9],"sf":[]},{"i":8,"p":[2,3,4,7],"sf":[]},{"i":9,"p":[2,3,4,7,9],"sf":[]},{"i":10,"p":[3,4],"sf":[]},{"i":11,"p":[5,6],"sf":[]},{"i":12,"p":[6,8],"sf":[]},{"i":13,"p":[6,8,9],"sf":[]},{"i":14,"p":[5,6,8],"sf":[]},{"i":15,"p":[5,6,8,9],"sf":[]},{"i":16,"p":[5,6,8,9,10],"sf":[]},{"i":17,"p":[7,8,9],"sf":[]},{"i":18,"p":[7,8],"sf":[]},{"i":19,"p":[7,9],"sf":[]},{"i":20,"p":[7,8,9,10],"sf":[]},{"i":21,"p":[8,9,10],"sf":[]},{"i":22,"p":[8,10],"sf":[]},{"i":23,"p":[2,4,6,7,8],"sf":[]},{"i":24,"p":[2,4,6,7,8,9],"sf":[]},{"i":25,"p":[2,3,4,5,6,7,8],"sf":[]},{"i":26,"p":[2,3,4,5,6,7,8,9],"sf":[]},{"i":27,"p":[3,5],"sf":[]},{"i":28,"p":[2,4,6],"sf":[]},{"i":29,"p":[2,7,8,9],"sf":[]},{"i":30,"p":[2,4,5,6,7,8,9],"sf":[]},{"i":31,"p":[2,4,5,6,7,8,9,10],"sf":[]},{"i":32,"p":[2,5,6,7,8,9],"sf":[]},{"i":33,"p":[2,5,6,7,8,9,10],"sf":[]},{"i":34,"p":[2,5,6,8,9],"sf":[]},{"i":35,"p":[2,5,6,8,9,10],"sf":[]},{"i":36,"p":[2,5,6,7],"sf":[]},{"i":37,"p":[2,5,6,7,10],"sf":[]},{"i":38,"p":[2,3,4,7,10],"sf":[]},{"i":39,"p":[2,3,4,7,9,10],"sf":[]},{"i":40,"p":[2,3,4,7,8,9,10],"sf":[]},{"i":41,"p":[2,3,4,6,7,8,9,10],"sf":[]},{"i":42,"p":[2,3,4,5,6,7,8,9,10],"sf":[]}]}')},function(e,t,n){"use strict";n.d(t,"a",(function(){return a}));var r=n(3),i=n.n(r),o=n(4),s=n.n(o),a=function(){function e(t,n,r){i()(this,e),this.userStatus=this.getConsentsAndLegitimateInterests(t()),this.setUserStatus=n,this.action=r}return s()(e,[{key:"getConsentsAndLegitimateInterests",value:function(e){return{purposesConsents:e.purposes.consent,vendorsConsents:e.vendors.consent,vendorsLegitimateInterests:e.vendors.legitimate_interest,purposesLegitimateInterests:e.purposes.legitimate_interest}}},{key:"enablePurpose",value:function(e){-1===this.userStatus.purposesConsents.enabled.indexOf(e)&&this.userStatus.purposesConsents.enabled.push(e);var t=this.userStatus.purposesConsents.disabled.indexOf(e);return-1!==t&&this.userStatus.purposesConsents.disabled.splice(t,1),this}},{key:"enablePurposes",value:function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];for(var r=0;r<t.length;r++){var i=t[r];this.enablePurpose(i)}return this}},{key:"disablePurpose",value:function(e){-1===this.userStatus.purposesConsents.disabled.indexOf(e)&&this.userStatus.purposesConsents.disabled.push(e);var t=this.userStatus.purposesConsents.enabled.indexOf(e);return-1!==t&&this.userStatus.purposesConsents.enabled.splice(t,1),this}},{key:"disablePurposes",value:function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];for(var r=0;r<t.length;r++){var i=t[r];this.disablePurpose(i)}return this}},{key:"enableVendor",value:function(e){-1===this.userStatus.vendorsConsents.enabled.indexOf(e)&&this.userStatus.vendorsConsents.enabled.push(e);var t=this.userStatus.vendorsConsents.disabled.indexOf(e);return-1!==t&&this.userStatus.vendorsConsents.disabled.splice(t,1),this}},{key:"enableVendors",value:function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];for(var r=0;r<t.length;r++){var i=t[r];this.enableVendor(i)}return this}},{key:"disableVendor",value:function(e){-1===this.userStatus.vendorsConsents.disabled.indexOf(e)&&this.userStatus.vendorsConsents.disabled.push(e);var t=this.userStatus.vendorsConsents.enabled.indexOf(e);return-1!==t&&this.userStatus.vendorsConsents.enabled.splice(t,1),this}},{key:"disableVendors",value:function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];for(var r=0;r<t.length;r++){var i=t[r];this.disableVendor(i)}return this}},{key:"enableVendorLegitimateInterests",value:function(e){-1===this.userStatus.vendorsLegitimateInterests.enabled.indexOf(e)&&this.userStatus.vendorsLegitimateInterests.enabled.push(e);var t=this.userStatus.vendorsLegitimateInterests.disabled.indexOf(e);return-1!==t&&this.userStatus.vendorsLegitimateInterests.disabled.splice(t,1),this}},{key:"enableVendorsLegitimateInterests",value:function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];for(var r=0;r<t.length;r++){var i=t[r];this.enableVendorLegitimateInterests(i)}return this}},{key:"disableVendorLegitimateInterests",value:function(e){-1===this.userStatus.vendorsLegitimateInterests.disabled.indexOf(e)&&this.userStatus.vendorsLegitimateInterests.disabled.push(e);var t=this.userStatus.vendorsLegitimateInterests.enabled.indexOf(e);return-1!==t&&this.userStatus.vendorsLegitimateInterests.enabled.splice(t,1),this}},{key:"disableVendorsLegitimateInterests",value:function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];for(var r=0;r<t.length;r++){var i=t[r];this.disableVendorLegitimateInterests(i)}return this}},{key:"enablePurposeLegitimateInterest",value:function(e){-1===this.userStatus.purposesLegitimateInterests.enabled.indexOf(e)&&this.userStatus.purposesLegitimateInterests.enabled.push(e);var t=this.userStatus.purposesLegitimateInterests.disabled.indexOf(e);return-1!==t&&this.userStatus.purposesLegitimateInterests.disabled.splice(t,1),this}},{key:"enablePurposesLegitimateInterests",value:function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];for(var r=0;r<t.length;r++){var i=t[r];this.enablePurposeLegitimateInterest(i)}return this}},{key:"disablePurposeLegitimateInterest",value:function(e){-1===this.userStatus.purposesLegitimateInterests.disabled.indexOf(e)&&this.userStatus.purposesLegitimateInterests.disabled.push(e);var t=this.userStatus.purposesLegitimateInterests.enabled.indexOf(e);return-1!==t&&this.userStatus.purposesLegitimateInterests.enabled.splice(t,1),this}},{key:"disablePurposesLegitimateInterests",value:function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];for(var r=0;r<t.length;r++){var i=t[r];this.disablePurposeLegitimateInterest(i)}return this}},{key:"commit",value:function(){var e={purposes:{consent:this.userStatus.purposesConsents,legitimate_interest:this.userStatus.purposesLegitimateInterests},vendors:{consent:this.userStatus.vendorsConsents,legitimate_interest:this.userStatus.vendorsLegitimateInterests},action:this.action};this.setUserStatus(e)}}]),e}()},function(e,t,n){"use strict";n.d(t,"a",(function(){return i}));var r=new RegExp("([0-9]{4})(-([0-9]{2})(-([0-9]{2})(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\\.([0-9]+))?)?(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?");function i(e){if("string"!=typeof e)return null;var t=e.match(r);if(null===t)return null;var n=0,i=new Date(t[1],0,1);t[3]&&i.setMonth(t[3]-1),t[5]&&i.setDate(t[5]),t[7]&&i.setHours(t[7]),t[8]&&i.setMinutes(t[8]),t[10]&&i.setSeconds(t[10]),t[12]&&i.setMilliseconds(1e3*"0.".concat(t[12])),t[14]&&(n=60*t[16]+parseInt(t[17],10),n*="-"===t[15]?1:-1),n-=i.getTimezoneOffset();var o=i.getTime()+60*n*1e3;return new Date(o)}},function(e,t,n){"use strict";n.d(t,"b",(function(){return v})),n.d(t,"e",(function(){return g})),n.d(t,"f",(function(){return b})),n.d(t,"d",(function(){return y})),n.d(t,"c",(function(){return m})),n.d(t,"a",(function(){return S}));var r=n(1),i=n.n(r),o=n(11),s=n.n(o),a=n(33),c=n.n(a),u=n(8),p=n(0),l=n(28),f=n(14);function d(e,t){return"object"===s()(e)&&(e[t]||(e[t]={}),e[t].disabled||(e[t].disabled=[]),e[t].enabled||(e[t].enabled=[])),e}function v(e){try{var t=JSON.parse(c.a.decode(e));return d(t,"purposes"),d(t,"purposes_li"),d(t,"vendors"),d(t,"vendors_li"),t}catch(e){return null}}function h(e,t){if(e[t]){var n=Array.isArray(e[t].enabled)&&e[t].enabled.length,r=Array.isArray(e[t].disabled)&&e[t].disabled.length;n||r?n?r||delete e[t].disabled:delete e[t].enabled:delete e[t]}return e}function g(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[];if(!e||"object"!==s()(e))return null;var n=Object(p.b)(e),r=Object(p.f)(n,"vendors.enabled"),i=Object(p.f)(n,"vendors.disabled"),o=Object(p.f)(n,"vendors_li.enabled"),a=Object(p.f)(n,"vendors_li.disabled"),u=function(e){return"number"!=typeof e};if(Array.isArray(r)&&(n.vendors.enabled=r.filter(u)),Array.isArray(o)&&(n.vendors_li.enabled=o.filter(u)),Array.isArray(i)&&(n.vendors.disabled=i.filter(u)),Array.isArray(a)&&(n.vendors_li.disabled=a.filter(u)),t.length){var l=Object(p.f)(e,"purposes.enabled"),f=Object(p.f)(e,"purposes.disabled"),d=Object(p.f)(e,"purposes_li.enabled"),v=Object(p.f)(e,"purposes_li.disabled"),g=function(e){return-1===t.indexOf(e)};Array.isArray(l)&&l.length&&(n.purposes.enabled=n.purposes.enabled.filter(g)),Array.isArray(f)&&f.length&&(n.purposes.disabled=n.purposes.disabled.filter(g)),Array.isArray(d)&&d.length&&(n.purposes_li.enabled=n.purposes_li.enabled.filter(g)),Array.isArray(v)&&v.length&&(n.purposes_li.disabled=n.purposes_li.disabled.filter(g))}return h(n,"purposes"),h(n,"purposes_li"),h(n,"vendors"),h(n,"vendors_li"),c.a.encode(JSON.stringify(n))}function b(e,t,n,r){return Object(u.i)(Object(p.f)(e,"purposes.enabled")||[],Object(p.f)(e,"vendors.enabled")||[],Object(f.g)(new Date(Object(p.f)(e,"created"))),Object(f.g)(new Date(Object(p.f)(e,"updated"))),t,n,r)}function y(e){return v(e.split(".")[1])}function m(e,t){if(!e||!e.updated)return!1;var n=Object(l.a)(e.updated);return!!n&&((new Date).getTime()-n.getTime())/1e3>=t}function S(e){var t=[].concat(i()(Object(p.f)(e,"vendors.enabled",[])),i()(Object(p.f)(e,"purposes.enabled",[]))),n=[].concat(i()(Object(p.f)(e,"vendors.disabled",[])),i()(Object(p.f)(e,"purposes.disabled",[])));return 0===t.length&&n.length>0}},function(e,t,n){"use strict";function r(e){return s()?window.localStorage.getItem(e):null}function i(e,t){if(s())try{window.localStorage.setItem(e,t)}catch(e){}}function o(e){s()&&window.localStorage.removeItem(e)}function s(){try{return!!window.localStorage}catch(e){return!1}}n.d(t,"b",(function(){return r})),n.d(t,"c",(function(){return i})),n.d(t,"a",(function(){return o}))},function(e,t,n){var r=n(102),i=n(103),o=n(60),s=n(104);e.exports=function(e,t){return r(e)||i(e,t)||o(e,t)||s()},e.exports.__esModule=!0,e.exports.default=e.exports},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(44),i=n(128),o=function(){function e(){}return e.reset=function(){delete this.cmpId,delete this.cmpVersion,delete this.eventStatus,delete this.gdprApplies,delete this.tcModel,delete this.tcString,delete this.tcfPolicyVersion,this.cmpStatus=r.CmpStatus.LOADING,this.disabled=!1,this.displayStatus=r.DisplayStatus.HIDDEN,this.eventQueue.clear()},e.apiVersion="2",e.eventQueue=new i.EventListenerQueue,e.cmpStatus=r.CmpStatus.LOADING,e.disabled=!1,e.displayStatus=r.DisplayStatus.HIDDEN,e}();t.CmpApiModel=o},function(e,t,n){(function(e,r){var i;!function(o){var s=t,a=(e&&e.exports,"object"==typeof r&&r);a.global!==a&&a.window;var c=function(e){this.message=e};(c.prototype=new Error).name="InvalidCharacterError";var u=function(e){throw new c(e)},p="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",l=/[\t\n\f\r ]/g,f={encode:function(e){e=String(e),/[^\0-\xFF]/.test(e)&&u("The string to be encoded contains characters outside of the Latin1 range.");for(var t,n,r,i,o=e.length%3,s="",a=-1,c=e.length-o;++a<c;)t=e.charCodeAt(a)<<16,n=e.charCodeAt(++a)<<8,r=e.charCodeAt(++a),s+=p.charAt((i=t+n+r)>>18&63)+p.charAt(i>>12&63)+p.charAt(i>>6&63)+p.charAt(63&i);return 2==o?(t=e.charCodeAt(a)<<8,n=e.charCodeAt(++a),s+=p.charAt((i=t+n)>>10)+p.charAt(i>>4&63)+p.charAt(i<<2&63)+"="):1==o&&(i=e.charCodeAt(a),s+=p.charAt(i>>2)+p.charAt(i<<4&63)+"=="),s},decode:function(e){var t=(e=String(e).replace(l,"")).length;t%4==0&&(t=(e=e.replace(/==?$/,"")).length),(t%4==1||/[^+a-zA-Z0-9/]/.test(e))&&u("Invalid character: the string to be decoded is not correctly encoded.");for(var n,r,i=0,o="",s=-1;++s<t;)r=p.indexOf(e.charAt(s)),n=i%4?64*n+r:r,i++%4&&(o+=String.fromCharCode(255&n>>(-2*i&6)));return o},version:"0.1.0"};void 0===(i=function(){return f}.call(t,n,t,e))||(e.exports=i)}()}).call(this,n(105)(e),n(38))},function(e,t,n){"use strict";var r=this&&this.__values||function(e){var t="function"==typeof Symbol&&Symbol.iterator,n=t&&e[t],r=0;if(n)return n.call(e);if(e&&"number"==typeof e.length)return{next:function(){return e&&r>=e.length&&(e=void 0),{value:e&&e[r++],done:!e}}};throw new TypeError(t?"Object is not iterable.":"Symbol.iterator is not defined.")};Object.defineProperty(t,"__esModule",{value:!0});var i=function(){function e(){}return e.prototype.clone=function(){var e=this,t=new this.constructor;return Object.keys(this).forEach((function(n){var r=e.deepClone(e[n]);void 0!==r&&(t[n]=r)})),t},e.prototype.deepClone=function(e){var t,n,i=typeof e;if("number"===i||"string"===i||"boolean"===i)return e;if(null!==e&&"object"===i){if("function"==typeof e.clone)return e.clone();if(e instanceof Date)return new Date(e.getTime());if(void 0!==e[Symbol.iterator]){var o=[];try{for(var s=r(e),a=s.next();!a.done;a=s.next()){var c=a.value;o.push(this.deepClone(c))}}catch(e){t={error:e}}finally{try{a&&!a.done&&(n=s.return)&&n.call(s)}finally{if(t)throw t.error}}return e instanceof Array?o:new e.constructor(o)}var u={};for(var p in e)e.hasOwnProperty(p)&&(u[p]=this.deepClone(e[p]));return u}},e}();t.Cloneable=i},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(22),i=function(){function e(){}return e.encode=function(e,t){var n;if("string"==typeof e&&(e=parseInt(e,10)),(n=e.toString(2)).length>t||e<0)throw new r.EncodingError(e+" too large to encode into "+t);return n.length<t&&(n="0".repeat(t-n.length)+n),n},e.decode=function(e,t){if(t!==e.length)throw new r.DecodingError("invalid bit length");return parseInt(e,2)},e}();t.IntEncoder=i},function(e,t,n){"use strict";n.d(t,"a",(function(){return l}));var r=n(5),i=n.n(r),o=n(11),s=n.n(o),a=function(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#039;")},c=function(e){if("object"===s()(e)){var t=JSON.stringify(e);return JSON.parse(a(t))}return"string"==typeof e?a(e):e};function u(e){return Array.isArray(e)?e.map((function(e){return c(e)})):"string"==typeof e?c(e):e}function p(e,t,n,r){if(r&&r.data){var o,s="string"==typeof r.data;try{o=s?JSON.parse(r.data):r.data}catch(e){return}if(o[e]){var a=o[e];n(a.command,u(a.parameter),(function(e,n){var o=i()({},t,{returnValue:e,success:n,callId:a.callId});r.source&&"function"==typeof r.source.postMessage?r.source.postMessage(s?JSON.stringify(o):o,"*"):window.postMessage(s?JSON.stringify(o):o,"*")}))}}}function l(e,t,n,r){if(window.addEventListener?window.addEventListener("message",p.bind(this,e,t,n),!1):window.attachEvent("onmessage",p.bind(this,e,t,n)),window.DidomiSanitizing={sanitizeString:u},Array.isArray(r)&&r.length>0)for(var i=0;i<r.length;i++){var o=r[i];n(o.command,u(o.parameter),o.callback,o.version,!0)}}},function(e,t,n){"use strict";n.r(t),n.d(t,"initialState",(function(){return u})),n.d(t,"actions",(function(){return p}));var r=n(5),i=n.n(r),o=n(40);function s(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?s(Object(n),!0).forEach((function(t){i()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):s(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var c=(new Date).toISOString(),u={consent:{user_id:Object(o.a)(),created:c,updated:c,vendors:{enabled:[],disabled:[]},purposes:{enabled:[],disabled:[]},vendors_li:{enabled:[],disabled:[]},purposes_li:{enabled:[],disabled:[]},dns:void 0,dnsd:void 0,version:null,ac:void 0,sync:void 0},iab:{consentString:null,consentStringPresentFromStorage:!1,decodedAdditionalConsent:void 0},optout:{user_id:Object(o.a)(),created:c,updated:c,vendors_li:{enabled:[],disabled:[]},purposes_li:{enabled:[],disabled:[]},dns:void 0}},p=function(){return{setConsentByVendor:function(e,t){return{consentByVendor:t}},setConsent:function(e,t){return{consent:t}},setOptout:function(e,t){return{optout:t}},setConsentString:function(e,t){return a(a({},e),{},{iab:{consentString:t}})},setConsentStringPresentFromStorage:function(e,t){return{iab:a(a({},e.iab),{},{consentStringPresentFromStorage:!0===t})}},setLastSyncDate:function(e,t){return{consent:a(a({},e.consent),{},{sync:t})}},setDecodedAdditionalConsent:function(e,t){return{iab:a(a({},e.iab),{},{decodedAdditionalConsent:t})}}}}},function(e,t){var n;n=function(){return this}();try{n=n||new Function("return this")()}catch(e){"object"==typeof window&&(n=window)}e.exports=n},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=function(){function e(){}return e.encode=function(e){return+e+""},e.decode=function(e){return"1"===e},e}();t.BooleanEncoder=r},function(e,t,n){"use strict";function r(){var e=Math.round((new Date).getTime()).toString(16);return"".concat(e.substring(0,8),"-").concat(e.substring(8),"x-6xxx-yxxx-xxxxxxxxxxxx").replace(/[xy]/g,(function(e){var t=16*Math.random()|0;return("x"===e?t:3&t|8).toString(16)}))}n.d(t,"a",(function(){return r}))},function(e,t,n){"use strict";n.d(t,"b",(function(){return h})),n.d(t,"a",(function(){return g}));var r=n(3),i=n.n(r),o=n(4),s=n.n(o),a=n(6),c=n.n(a),u=n(7),p=n.n(u),l=n(2),f=n.n(l);function d(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=f()(e);if(t){var i=f()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return p()(this,n)}}var v=/Chrome\/([0-9]{2,3})\./i;function h(e){return function(e){var t=e.chrome,n=e.navigator,r=n.vendor,i=void 0!==e.opr,o=n.userAgent.indexOf("Edge")>-1;return!n.userAgent.match("CriOS")&&(null!=t&&"Google Inc."===r&&!1===i&&!1===o)}(e)&&(t=e.navigator.userAgent,((n=v.exec(t))?parseInt(n[1],10):null)>=79);var t,n}function g(){return!("function"==typeof Set&&"function"==typeof Symbol&&"function"==typeof Object.assign&&"function"==typeof[].find&&"function"==typeof Array.from&&"function"==typeof Promise&&"function"==typeof[].includes&&"function"==typeof Number.isInteger&&"function"==typeof"".repeat&&"function"==typeof WeakSet&&"function"==typeof(new(function(e){c()(n,e);var t=d(n);function n(){return i()(this,n),t.apply(this,arguments)}return s()(n,[{key:"method",value:function(){}}]),n}(s()((function e(){i()(this,e)}))))).method&&1===new Map([["key","value"]]).size)}},function(e,t,n){"use strict";function r(e){for(var n in e)t.hasOwnProperty(n)||(t[n]=e[n])}Object.defineProperty(t,"__esModule",{value:!0}),r(n(84)),r(n(129)),r(n(130)),r(n(43)),r(n(85))},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(32);t.Response=function(){this.cmpId=r.CmpApiModel.cmpId,this.cmpVersion=r.CmpApiModel.cmpVersion,this.gdprApplies=r.CmpApiModel.gdprApplies,this.tcfPolicyVersion=r.CmpApiModel.tcfPolicyVersion}},function(e,t,n){"use strict";function r(e){for(var n in e)t.hasOwnProperty(n)||(t[n]=e[n])}Object.defineProperty(t,"__esModule",{value:!0}),r(n(125)),r(n(126)),r(n(127))},function(e,t,n){"use strict";var r,i=this&&this.__extends||(r=function(e,t){return(r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}r(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)});Object.defineProperty(t,"__esModule",{value:!0});var o=n(46),s=n(42),a=function(e){function t(){return null!==e&&e.apply(this,arguments)||this}return i(t,e),t.prototype.respond=function(){this.throwIfParamInvalid(),this.invokeCallback(new s.TCData(this.param,this.listenerId))},t.prototype.throwIfParamInvalid=function(){if(!(void 0===this.param||Array.isArray(this.param)&&this.param.every(Number.isInteger)))throw new Error("Invalid Parameter")},t}(o.Command);t.GetTCDataCommand=a},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=function(){function e(e,t,n,r){this.success=!0,Object.assign(this,{callback:e,listenerId:n,param:t,next:r});try{this.respond()}catch(e){this.invokeCallback(null)}}return e.prototype.invokeCallback=function(e){var t=null!==e;"function"==typeof this.next?this.callback(this.next,e,t):this.callback(e,t)},e}();t.Command=r},function(e,t,n){"use strict";n.d(t,"a",(function(){return h}));var r=n(3),i=n.n(r),o=n(4),s=n.n(o),a=n(6),c=n.n(a),u=n(7),p=n.n(u),l=n(2),f=n.n(l),d=n(12);function v(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=f()(e);if(t){var i=f()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return p()(this,n)}}var h=["ca","de","en","es","fr","hr","it","nl","pt","fi","cs","pl","ro","el","hu","da","sk","bg","sl","lt","sv","et","lv","tr","ru","uk","ja","vi","ar","zh-TW","zh-CN","sr","ko","th","ms","az-AZ","bn-IN","fil","he","hi-IN","id","mk-MK","pt-BR","sw","no"],g={zh:"CN",az:"AZ",bn:"IN",hi:"IN",mk:"MK",pt:"BR"},b=function(e){c()(n,e);var t=v(n);function n(){return i()(this,n),t.apply(this,arguments)}return s()(n,[{key:"init",value:function(){this.setLocale(this.checkLanguage(this.getBrowserLanguage()))}},{key:"getAvailableDefaultingLanguage",value:function(e){if(!(-1!==e.indexOf("-")))return null;var t=e.split("-")[0],n=g[t];return n?"".concat(t,"-").concat(n):null}},{key:"configure",value:function(e){if(e){var t=this.store.getState().languages;if(Array.isArray(e.enabled)&&e.enabled.length>0){for(var n=[],r=0,i=e.enabled;r<i.length;r++){var o=i[r];if(-1===h.indexOf(o)){var s=this.getAvailableDefaultingLanguage(o);s?n.push(s):console.error("Didomi - The language ".concat(o," is not supported"))}else n.push(o)}n.length>0&&(t.enabled=n),-1===t.enabled.indexOf(t.default)&&(t.default=t.enabled[0]),1===n.length&&(t.default=n[0])}if(e.default)if(-1===t.enabled.indexOf(e.default)){var a=this.getAvailableDefaultingLanguage(e.default);a?t.default=a:console.error("Didomi - Default language '".concat(e.default,"' must be in the list of enabled languages"))}else t.default=e.default;this.actions.setLanguagesConfig(t),this.setLocale(this.checkLanguage(this.getBrowserLanguage()))}}},{key:"getLocale",value:function(){return this.locale}},{key:"setLocale",value:function(e){this.locale=e}},{key:"getBrowserLanguage",value:function(){return navigator.languages&&navigator.languages[0]||navigator.language||navigator.userLanguage}},{key:"getPreferredLanguage",value:function(e){return-1!==h.indexOf(e)?e:e.substr(0,2)}},{key:"checkLanguage",value:function(e){var t=this.getPreferredLanguage(e);return-1!==this.store.getState().languages.enabled.indexOf(t)?t:this.store.getState().languages.default}},{key:"localeCompare",value:function(e,t){try{return e.localeCompare(t,this.getLocale())}catch(n){return e>t?1:-1}}}]),n}(d.a);t.b=b},function(e,t){function n(e,t){return e||(e=this instanceof n?this:{}),function(t,r){return Object.defineProperties(e,{setMaxListeners:{value:function(t){return r.maxListeners=t,e}},maxListeners:{get:function(){return void 0===r.maxListeners?n.defaultMaxListeners:r.maxListeners}},setLogger:{value:function(t){return r.logger=t,e}},logger:{get:function(){return void 0===r.logger?n.logger:r.logger}},emit:{value:i},on:{value:o},once:{value:function(t,n){return n._once=1,e.on(t,n)}},off:{value:s},addListener:{value:o},removeListener:{value:s},removeAllListeners:{value:s},listeners:{value:function(e){return t[e]?t[e].slice():[]}},listenerTypes:{value:a},listenerCount:{value:function e(n){if(!n){var r=0;return a().forEach((function(t){r+=e(t)})),r}if("object"==typeof n&&n.length)return a().map((function(t){return e(t)}));return t[n]&&t[n].length||0}}});function i(n){var r,i;if(!("error"!==n||t.error&&t.error.length))throw arguments[1]instanceof Error?i=arguments[1]:(i=new Error("Unhandled error event: "+arguments[1])).context=arguments[1],i;return!!t[n]&&(r=Array.prototype.slice.call(arguments,1),t[n].slice().forEach((function(t){t._once&&1!==t._once||(t._once++,t.apply(e,r)),t._once&&s(n,t)})),e)}function o(n,r){if(t.newListener&&e.emit("newListener",n,r),t[n]=t[n]||[],t[n].push(r),!t[n].warned){var i=e.maxListeners;i&&i>0&&t[n].length>i&&(t[n].warned=!0,e.logger.warn("Possible EventEmitter memory leak detected for '%s' event. %d listeners added. Use emitter.setMaxListeners() to increase limit.",n,t[n].length),e.logger.trace&&e.logger.trace())}return e}function s(n,r){if(!r&&!t.removeListener)return n?t[n]&&delete t[n]:t={},e;if(!n){for(var o in t)"removeListener"!=o&&s(o);return s("removeListener"),t={},e}if(!t[n])return e;if(!r){for(;t[n].length;)s(n,t[n][t[n].length-1]);return delete t[n],e}var a=t[n].indexOf(r);return a<0||(t[n].splice(a,1),t.removeListener&&i("removeListener",n,r)),e}function a(){return Object.keys(t)}}({},{logger:t&&t.logger,maxListeners:t&&t.maxListeners})}n.EventEmitter=n,n.defaultMaxListeners=10,n.logger="object"==typeof console&&console||{warn:function(){}},n.setLogger=function(e){n.logger=e},e.exports=n},function(e,t,n){var r=n(106);function i(){return"undefined"!=typeof Reflect&&Reflect.get?(e.exports=i=Reflect.get,e.exports.__esModule=!0,e.exports.default=e.exports):(e.exports=i=function(e,t,n){var i=r(e,t);if(i){var o=Object.getOwnPropertyDescriptor(i,t);return o.get?o.get.call(arguments.length<3?e:n):o.value}},e.exports.__esModule=!0,e.exports.default=e.exports),i.apply(this,arguments)}e.exports=i,e.exports.__esModule=!0,e.exports.default=e.exports},function(e,t){e.exports=function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e},e.exports.__esModule=!0,e.exports.default=e.exports},function(e,t,n){"use strict";n.d(t,"b",(function(){return r})),n.d(t,"e",(function(){return i})),n.d(t,"d",(function(){return o})),n.d(t,"a",(function(){return s})),n.d(t,"c",(function(){return a})),n.d(t,"f",(function(){return c}));var r=function(e){return e.optoutPreferences.purposes},i=function(e){return e.optoutPreferences.vendors},o=function(e){return e.optoutPreferences.sellMyDataState},s=function(e){return e.optoutPreferences.allPartnersState},a=function(e){return e.optoutPreferences.purposesState},c=function(e){return e.optoutPreferences.vendorsState}},function(e,t,n){"use strict";function r(e){for(var n in e)t.hasOwnProperty(n)||(t[n]=e[n])}Object.defineProperty(t,"__esModule",{value:!0}),r(n(67)),r(n(53)),r(n(119)),r(n(123)),r(n(72)),r(n(78))},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(23),i=function(){function e(){}var t,n,i,o,s,a,c,u,p,l,f,d,v,h,g,b,y,m;return t=r.Fields.cmpId,n=r.Fields.cmpVersion,i=r.Fields.consentLanguage,o=r.Fields.consentScreen,s=r.Fields.created,a=r.Fields.isServiceSpecific,c=r.Fields.lastUpdated,u=r.Fields.policyVersion,p=r.Fields.publisherCountryCode,l=r.Fields.publisherLegitimateInterests,f=r.Fields.publisherConsents,d=r.Fields.purposeConsents,v=r.Fields.purposeLegitimateInterests,h=r.Fields.purposeOneTreatment,g=r.Fields.specialFeatureOptins,b=r.Fields.useNonStandardStacks,y=r.Fields.vendorListVersion,m=r.Fields.version,e[t]=12,e[n]=12,e[i]=12,e[o]=6,e[s]=36,e[a]=1,e[c]=36,e[u]=6,e[p]=12,e[l]=24,e[f]=24,e[d]=24,e[v]=24,e[h]=1,e[g]=12,e[b]=1,e[y]=12,e[m]=6,e.anyBoolean=1,e.encodingType=1,e.maxId=16,e.numCustomPurposes=6,e.numEntries=12,e.numRestrictions=12,e.purposeId=6,e.restrictionType=2,e.segmentType=3,e.singleOrRange=1,e.vendorId=16,e}();t.BitLength=i},function(e,t,n){"use strict";var r;Object.defineProperty(t,"__esModule",{value:!0}),(r=t.RestrictionType||(t.RestrictionType={}))[r.NOT_ALLOWED=0]="NOT_ALLOWED",r[r.REQUIRE_CONSENT=1]="REQUIRE_CONSENT",r[r.REQUIRE_LI=2]="REQUIRE_LI"},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(39),i=n(22),o=n(23),s=function(){function e(){}return e.encode=function(e,t){for(var n="",i=1;i<=t;i++)n+=r.BooleanEncoder.encode(e.has(i));return n},e.decode=function(e,t){if(e.length!==t)throw new i.DecodingError("bitfield encoding length mismatch");for(var n=new o.Vector,s=1;s<=t;s++)r.BooleanEncoder.decode(e[s-1])&&n.set(s);return n.bitLength=e.length,n},e}();t.FixedVectorEncoder=s},function(e,t,n){"use strict";function r(e,t){if(null!=t){if(t.then)return t.then(e.setState);e.setState(t)}}function i(e,t){return function(){for(var n=[],i=0;i<arguments.length;i++)n[i]=arguments[i];return"function"==typeof t.middleware?t.middleware(t,e,n):r(t,e.apply(void 0,[t.getState()].concat(n)))}}Object.defineProperty(t,"__esModule",{value:!0});var o=function(){return(o=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var i in t=arguments[n])Object.prototype.hasOwnProperty.call(t,i)&&(e[i]=t[i]);return e}).apply(this,arguments)};t.bindActions=function(e,t,n){e="function"==typeof e?e(t,n):e;var r={};for(var o in e){var s=e[o];r[o]=i(s,t)}return r},t.combineActions=function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];return function(){for(var t=[],n=0;n<arguments.length;n++)t[n]=arguments[n];return e.reduce((function(e,n){return o({},e,"function"==typeof n?n.apply(void 0,t):n)}),{})}}},function(e,t,n){(function(e){var r=void 0!==e&&e||"undefined"!=typeof self&&self||window,i=Function.prototype.apply;function o(e,t){this._id=e,this._clearFn=t}t.setTimeout=function(){return new o(i.call(setTimeout,r,arguments),clearTimeout)},t.setInterval=function(){return new o(i.call(setInterval,r,arguments),clearInterval)},t.clearTimeout=t.clearInterval=function(e){e&&e.close()},o.prototype.unref=o.prototype.ref=function(){},o.prototype.close=function(){this._clearFn.call(r,this._id)},t.enroll=function(e,t){clearTimeout(e._idleTimeoutId),e._idleTimeout=t},t.unenroll=function(e){clearTimeout(e._idleTimeoutId),e._idleTimeout=-1},t._unrefActive=t.active=function(e){clearTimeout(e._idleTimeoutId);var t=e._idleTimeout;t>=0&&(e._idleTimeoutId=setTimeout((function(){e._onTimeout&&e._onTimeout()}),t))},n(94),t.setImmediate="undefined"!=typeof self&&self.setImmediate||void 0!==e&&e.setImmediate||this&&this.setImmediate,t.clearImmediate="undefined"!=typeof self&&self.clearImmediate||void 0!==e&&e.clearImmediate||this&&this.clearImmediate}).call(this,n(38))},function(e,t,n){e.exports=function(e,t,n,r,i){for(t=t.split?t.split("."):t,r=0;r<t.length;r++)e=e?e[t[r]]:i;return e===i?n:e}},function(e,t){e.exports=function(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r},e.exports.__esModule=!0,e.exports.default=e.exports},function(e,t,n){var r=n(59);e.exports=function(e,t){if(e){if("string"==typeof e)return r(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?r(e,t):void 0}},e.exports.__esModule=!0,e.exports.default=e.exports},function(e,t,n){"use strict";var r=n(107).ConsentString,i=n(65).decodeConsentString,o=n(62).encodeConsentString;e.exports={ConsentString:r,decodeConsentString:i,encodeConsentString:o}},function(e,t,n){"use strict";var r=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},i=n(63),o=i.encodeToBase64,s=i.padRight;function a(e){for(var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[],n="",r=1;r<=e;r+=1)n+=-1!==t.indexOf(r)?"1":"0";return s(n,Math.max(0,e-n.length))}function c(e){for(var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:new Set,n=0,r=0;r<e.length;r+=1)n=Math.max(n,e[r].id);for(var i=0;i<t.length;i+=1)n=Math.max(n,t[i]);for(var o="",s=1;s<=n;s+=1)o+=-1!==t.indexOf(s)?"1":"0";return o}function u(e,t){for(var n=[],r=[],i=e.map((function(e){return e.id})),o=0;o<e.length;o+=1){var s=e[o].id;if(-1!==t.indexOf(s)&&n.push(s),(-1===t.indexOf(s)||o===e.length-1||-1===i.indexOf(s+1))&&n.length){var a=n.shift(),c=n.pop();n=[],r.push({isRange:"number"==typeof c,startVendorId:a,endVendorId:c})}}return r}function p(e){var t=0;return e.forEach((function(e){e.id>t&&(t=e.id)})),t}e.exports={convertVendorsToRanges:u,encodeConsentString:function(e){var t=e.maxVendorId,n=e.vendorList,i=void 0===n?{}:n,s=e.allowedPurposeIds,l=e.allowedVendorIds,f=i.vendors,d=void 0===f?[]:f,v=i.purposes,h=void 0===v?[]:v;t||(t=p(d));var g=o(r({},e,{maxVendorId:t,purposeIdBitString:c(h,s),isRange:!1,vendorIdBitString:a(t,l)})),b=u(d,l),y=o(r({},e,{maxVendorId:t,purposeIdBitString:c(h,s),isRange:!0,defaultConsent:!1,numEntries:b.length,vendorRangeList:b}));return g.length<y.length?g:y},getMaxVendorId:p,encodeVendorIdsToBits:a,encodePurposeIdsToBits:c}},function(e,t,n){"use strict";var r=n(33),i=n(64),o=i.versionNumBits,s=i.vendorVersionMap;function a(e){for(var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"0",n="",r=0;r<e;r+=1)n+=t;return n}function c(e,t){return a(Math.max(0,t))+e}function u(e,t){return e+a(Math.max(0,t))}function p(e,t){var n="";return"number"!=typeof e||isNaN(e)||(n=parseInt(e,10).toString(2)),t>=n.length&&(n=c(n,t-n.length)),n.length>t&&(n=n.substring(0,t)),n}function l(e){return p(!0===e?1:0,1)}function f(e,t){return e instanceof Date?p(e.getTime()/100,t):p(e,t)}function d(e,t){return p(e.toUpperCase().charCodeAt(0)-65,t)}function v(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:12;return d(e.slice(0,1),t/2)+d(e.slice(1),t/2)}function h(e,t,n){return parseInt(e.substr(t,n),2)}function g(e,t,n){return new Date(100*h(e,t,n))}function b(e,t){return 1===parseInt(e.substr(t,1),2)}function y(e){var t=h(e);return String.fromCharCode(t+65).toLowerCase()}function m(e,t,n){var r=e.substr(t,n);return y(r.slice(0,n/2))+y(r.slice(n/2))}function S(e){var t=e.input,n=e.field,r=n.name,i=n.type,o=n.numBits,s=n.encoder,a=n.validator;if("function"==typeof a&&!a(t))return"";if("function"==typeof s)return s(t);var c="function"==typeof o?o(t):o,d=t[r],h=null==d?"":d;switch(i){case"int":return p(h,c);case"bool":return l(h);case"date":return f(h,c);case"bits":return u(h,c-h.length).substring(0,c);case"list":return h.reduce((function(e,t){return e+O({input:t,fields:n.fields})}),"");case"language":return v(h,c);default:throw new Error("ConsentString - Unknown field type "+i+" for encoding")}}function O(e){var t=e.input;return e.fields.reduce((function(e,n){return e+=S({input:t,field:n})}),"")}function C(e){var t=e.input,n=e.output,r=e.startPosition,i=e.field,o=i.type,s=i.numBits,a=i.decoder,c=i.validator,u=i.listCount;if("function"==typeof c&&!c(n))return{newPosition:r};if("function"==typeof a)return a(t,n,r);var p="function"==typeof s?s(n):s;switch(o){case"int":return{fieldValue:h(t,r,p)};case"bool":return{fieldValue:b(t,r)};case"date":return{fieldValue:g(t,r,p)};case"bits":return{fieldValue:t.substr(r,p)};case"list":return function(e,t,n,r,i){var o=0;"function"==typeof i?o=i(t):"number"==typeof i&&(o=i);for(var s=n,a=[],c=0;c<o;c+=1){var u=w({input:e,fields:r.fields,startPosition:s});s=u.newPosition,a.push(u.decodedObject)}return{fieldValue:a,newPosition:s}}(t,n,r,i,u);case"language":return{fieldValue:m(t,r,p)};default:throw new Error("ConsentString - Unknown field type "+o+" for decoding")}}function w(e){var t=e.input,n=e.fields,r=e.startPosition,i=void 0===r?0:r;return{decodedObject:n.reduce((function(e,n){var r=n.name,o=n.numBits,s=C({input:t,output:e,startPosition:i,field:n}),a=s.fieldValue,c=s.newPosition;return void 0!==a&&(e[r]=a),void 0!==c?i=c:"number"==typeof o&&(i+=o),e}),{}),newPosition:i}}function P(e,t){var n=e.version;if("number"!=typeof n)throw new Error("ConsentString - No version field to encode");if(t[n])return O({input:e,fields:t[n].fields});throw new Error("ConsentString - No definition for version "+n)}e.exports={padRight:u,padLeft:c,encodeField:S,encodeDataToBits:P,encodeIntToBits:p,encodeBoolToBits:l,encodeDateToBits:f,encodeLanguageToBits:v,encodeLetterToBits:d,encodeToBase64:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:s,n=P(e,t);if(n){for(var i=u(n,7-(n.length+7)%8),o="",a=0;a<i.length;a+=8)o+=String.fromCharCode(parseInt(i.substr(a,8),2));return r.encode(o).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}return null},decodeBitsToIds:function(e){return e.split("").reduce((function(e,t,n){return"1"===t&&-1===e.indexOf(n+1)&&e.push(n+1),e}),[])},decodeBitsToInt:h,decodeBitsToDate:g,decodeBitsToBool:b,decodeBitsToLanguage:m,decodeBitsToLetter:y,decodeFromBase64:function(e,t){for(var n=e;n.length%4!=0;)n+="=";n=n.replace(/-/g,"+").replace(/_/g,"/");for(var i=r.decode(n),a="",u=0;u<i.length;u+=1){var p=i.charCodeAt(u).toString(2);a+=c(p,8-p.length)}return function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:s,n=h(e,0,o);if("number"!=typeof n)throw new Error("ConsentString - Unknown version number in the string to decode");if(!s[n])throw new Error("ConsentString - Unsupported version "+n+" in the string to decode");var r=t[n].fields,i=w({input:e,fields:r}),a=i.decodedObject;return a}(a,t)}}},function(e,t,n){"use strict";e.exports={versionNumBits:6,vendorVersionMap:{1:{version:1,metadataFields:["version","created","lastUpdated","cmpId","cmpVersion","consentScreen","vendorListVersion"],fields:[{name:"version",type:"int",numBits:6},{name:"created",type:"date",numBits:36},{name:"lastUpdated",type:"date",numBits:36},{name:"cmpId",type:"int",numBits:12},{name:"cmpVersion",type:"int",numBits:12},{name:"consentScreen",type:"int",numBits:6},{name:"consentLanguage",type:"language",numBits:12},{name:"vendorListVersion",type:"int",numBits:12},{name:"purposeIdBitString",type:"bits",numBits:24},{name:"maxVendorId",type:"int",numBits:16},{name:"isRange",type:"bool",numBits:1},{name:"vendorIdBitString",type:"bits",numBits:function(e){return e.maxVendorId},validator:function(e){return!e.isRange}},{name:"defaultConsent",type:"bool",numBits:1,validator:function(e){return e.isRange}},{name:"numEntries",numBits:12,type:"int",validator:function(e){return e.isRange}},{name:"vendorRangeList",type:"list",listCount:function(e){return e.numEntries},validator:function(e){return e.isRange},fields:[{name:"isRange",type:"bool",numBits:1},{name:"startVendorId",type:"int",numBits:16},{name:"endVendorId",type:"int",numBits:16,validator:function(e){return e.isRange}}]}]}}}},function(e,t,n){"use strict";var r=n(63),i=r.decodeBitsToIds,o=r.decodeFromBase64;e.exports={decodeConsentString:function(e){var t=o(e),n=t.version,r=t.cmpId,s=t.vendorListVersion,a=t.purposeIdBitString,c=t.maxVendorId,u=t.created,p=t.lastUpdated,l=t.isRange,f=t.defaultConsent,d=t.vendorIdBitString,v=t.vendorRangeList,h=t.cmpVersion,g=t.consentScreen,b=t.consentLanguage,y={version:n,cmpId:r,vendorListVersion:s,allowedPurposeIds:i(a),maxVendorId:c,created:u,lastUpdated:p,cmpVersion:h,consentScreen:g,consentLanguage:b};if(l){var m=v.reduce((function(e,t){for(var n=t.isRange,r=t.startVendorId,i=t.endVendorId,o=n?i:r,s=r;s<=o;s+=1)e[s]=!0;return e}),{});y.allowedVendorIds=[];for(var S=1;S<=c;S+=1)(f&&!m[S]||!f&&m[S])&&-1===y.allowedVendorIds.indexOf(S)&&y.allowedVendorIds.push(S)}else y.allowedVendorIds=i(d);return y}}},function(e,t,n){"use strict";(function(t){var n=setTimeout;function r(){}function i(e){if(!(this instanceof i))throw new TypeError("Promises must be constructed via new");if("function"!=typeof e)throw new TypeError("not a function");this._state=0,this._handled=!1,this._value=void 0,this._deferreds=[],p(e,this)}function o(e,t){for(;3===e._state;)e=e._value;0!==e._state?(e._handled=!0,i._immediateFn((function(){var n=1===e._state?t.onFulfilled:t.onRejected;if(null!==n){var r;try{r=n(e._value)}catch(e){return void a(t.promise,e)}s(t.promise,r)}else(1===e._state?s:a)(t.promise,e._value)}))):e._deferreds.push(t)}function s(e,t){try{if(t===e)throw new TypeError("A promise cannot be resolved with itself.");if(t&&("object"==typeof t||"function"==typeof t)){var n=t.then;if(t instanceof i)return e._state=3,e._value=t,void c(e);if("function"==typeof n)return void p((r=n,o=t,function(){r.apply(o,arguments)}),e)}e._state=1,e._value=t,c(e)}catch(t){a(e,t)}var r,o}function a(e,t){e._state=2,e._value=t,c(e)}function c(e){2===e._state&&0===e._deferreds.length&&i._immediateFn((function(){e._handled||i._unhandledRejectionFn(e._value)}));for(var t=0,n=e._deferreds.length;t<n;t++)o(e,e._deferreds[t]);e._deferreds=null}function u(e,t,n){this.onFulfilled="function"==typeof e?e:null,this.onRejected="function"==typeof t?t:null,this.promise=n}function p(e,t){var n=!1;try{e((function(e){n||(n=!0,s(t,e))}),(function(e){n||(n=!0,a(t,e))}))}catch(e){if(n)return;n=!0,a(t,e)}}i.prototype.catch=function(e){return this.then(null,e)},i.prototype.then=function(e,t){var n=new this.constructor(r);return o(this,new u(e,t,n)),n},i.prototype.finally=function(e){var t=this.constructor;return this.then((function(n){return t.resolve(e()).then((function(){return n}))}),(function(n){return t.resolve(e()).then((function(){return t.reject(n)}))}))},i.all=function(e){return new i((function(t,n){if(!e||void 0===e.length)throw new TypeError("Promise.all accepts an array");var r=Array.prototype.slice.call(e);if(0===r.length)return t([]);var i=r.length;function o(e,s){try{if(s&&("object"==typeof s||"function"==typeof s)){var a=s.then;if("function"==typeof a)return void a.call(s,(function(t){o(e,t)}),n)}r[e]=s,0==--i&&t(r)}catch(e){n(e)}}for(var s=0;s<r.length;s++)o(s,r[s])}))},i.resolve=function(e){return e&&"object"==typeof e&&e.constructor===i?e:new i((function(t){t(e)}))},i.reject=function(e){return new i((function(t,n){n(e)}))},i.race=function(e){return new i((function(t,n){for(var r=0,i=e.length;r<i;r++)e[r].then(t,n)}))},i._immediateFn="function"==typeof t&&function(e){t(e)}||function(e){n(e,0)},i._unhandledRejectionFn=function(e){"undefined"!=typeof console&&console&&console.warn("Possible Unhandled Promise Rejection:",e)},e.exports=i}).call(this,n(57).setImmediate)},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(22),i=function(){function e(){}return e.encode=function(e){if(!/^[0-1]+$/.test(e))throw new r.EncodingError("Invalid bitField");var t=e.length%this.LCM;e+=t?"0".repeat(this.LCM-t):"";for(var n="",i=0;i<e.length;i+=this.BASIS)n+=this.DICT[parseInt(e.substr(i,this.BASIS),2)];return n},e.decode=function(e){if(!/^[A-Za-z0-9\-_]+$/.test(e))throw new r.DecodingError("Invalidly encoded Base64URL string");for(var t="",n=0;n<e.length;n++){var i=this.REVERSE_DICT.get(e[n]).toString(2);t+="0".repeat(this.BASIS-i.length)+i}return t},e.DICT="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",e.REVERSE_DICT=new Map([["A",0],["B",1],["C",2],["D",3],["E",4],["F",5],["G",6],["H",7],["I",8],["J",9],["K",10],["L",11],["M",12],["N",13],["O",14],["P",15],["Q",16],["R",17],["S",18],["T",19],["U",20],["V",21],["W",22],["X",23],["Y",24],["Z",25],["a",26],["b",27],["c",28],["d",29],["e",30],["f",31],["g",32],["h",33],["i",34],["j",35],["k",36],["l",37],["m",38],["n",39],["o",40],["p",41],["q",42],["r",43],["s",44],["t",45],["u",46],["v",47],["w",48],["x",49],["y",50],["z",51],["0",52],["1",53],["2",54],["3",55],["4",56],["5",57],["6",58],["7",59],["8",60],["9",61],["-",62],["_",63]]),e.BASIS=6,e.LCM=24,e}();t.Base64Url=i},function(e,t,n){"use strict";var r,i=this&&this.__extends||(r=function(e,t){return(r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}r(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)});Object.defineProperty(t,"__esModule",{value:!0});var o=function(e){function t(){var t=null!==e&&e.apply(this,arguments)||this;return t.root=null,t}return i(t,e),t.prototype.isEmpty=function(){return!this.root},t.prototype.add=function(e){var t,n={value:e,left:null,right:null};if(this.isEmpty())this.root=n;else for(t=this.root;;)if(e<t.value){if(null===t.left){t.left=n;break}t=t.left}else{if(!(e>t.value))break;if(null===t.right){t.right=n;break}t=t.right}},t.prototype.get=function(){for(var e=[],t=this.root;t;)if(t.left){for(var n=t.left;n.right&&n.right!=t;)n=n.right;n.right==t?(n.right=null,e.push(t.value),t=t.right):(n.right=t,t=t.left)}else e.push(t.value),t=t.right;return e},t.prototype.contains=function(e){for(var t=!1,n=this.root;n;){if(n.value===e){t=!0;break}e>n.value?n=n.right:e<n.value&&(n=n.left)}return t},t.prototype.min=function(e){var t;for(void 0===e&&(e=this.root);e;)e.left?e=e.left:(t=e.value,e=null);return t},t.prototype.max=function(e){var t;for(void 0===e&&(e=this.root);e;)e.right?e=e.right:(t=e.value,e=null);return t},t.prototype.remove=function(e,t){void 0===t&&(t=this.root);for(var n=null,r="left";t;)if(e<t.value)n=t,t=t.left,r="left";else if(e>t.value)n=t,t=t.right,r="right";else{if(t.left||t.right)if(t.left)if(t.right){var i=this.min(t.right);this.remove(i,t.right),t.value=i}else n?n[r]=t.left:this.root=t.left;else n?n[r]=t.right:this.root=t.right;else n?n[r]=null:this.root=null;t=null}},t}(n(34).Cloneable);t.BinarySearchTree=o},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=function(){function e(){}return e.cmpId="cmpId",e.cmpVersion="cmpVersion",e.consentLanguage="consentLanguage",e.consentScreen="consentScreen",e.created="created",e.supportOOB="supportOOB",e.isServiceSpecific="isServiceSpecific",e.lastUpdated="lastUpdated",e.numCustomPurposes="numCustomPurposes",e.policyVersion="policyVersion",e.publisherCountryCode="publisherCountryCode",e.publisherCustomConsents="publisherCustomConsents",e.publisherCustomLegitimateInterests="publisherCustomLegitimateInterests",e.publisherLegitimateInterests="publisherLegitimateInterests",e.publisherConsents="publisherConsents",e.publisherRestrictions="publisherRestrictions",e.purposeConsents="purposeConsents",e.purposeLegitimateInterests="purposeLegitimateInterests",e.purposeOneTreatment="purposeOneTreatment",e.specialFeatureOptins="specialFeatureOptins",e.useNonStandardStacks="useNonStandardStacks",e.vendorConsents="vendorConsents",e.vendorLegitimateInterests="vendorLegitimateInterests",e.vendorListVersion="vendorListVersion",e.vendorsAllowed="vendorsAllowed",e.vendorsDisclosed="vendorsDisclosed",e.version="version",e}();t.Fields=r},function(e,t,n){"use strict";var r,i=this&&this.__extends||(r=function(e,t){return(r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}r(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)});Object.defineProperty(t,"__esModule",{value:!0});var o=n(34),s=n(22),a=n(54),c=function(e){function t(t,n){var r=e.call(this)||this;return void 0!==t&&(r.purposeId=t),void 0!==n&&(r.restrictionType=n),r}return i(t,e),t.unHash=function(e){var n=e.split(this.hashSeparator),r=new t;if(2!==n.length)throw new s.TCModelError("hash",e);return r.purposeId=parseInt(n[0],10),r.restrictionType=parseInt(n[1],10),r},Object.defineProperty(t.prototype,"hash",{get:function(){if(!this.isValid())throw new Error("cannot hash invalid PurposeRestriction");return""+this.purposeId+t.hashSeparator+this.restrictionType},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"purposeId",{get:function(){return this.purposeId_},set:function(e){this.purposeId_=e},enumerable:!0,configurable:!0}),t.prototype.isValid=function(){return Number.isInteger(this.purposeId)&&this.purposeId>0&&(this.restrictionType===a.RestrictionType.NOT_ALLOWED||this.restrictionType===a.RestrictionType.REQUIRE_CONSENT||this.restrictionType===a.RestrictionType.REQUIRE_LI)},t.prototype.isSameAs=function(e){return this.purposeId===e.purposeId&&this.restrictionType===e.restrictionType},t.hashSeparator="-",t}(o.Cloneable);t.PurposeRestriction=c},function(e,t,n){"use strict";var r;Object.defineProperty(t,"__esModule",{value:!0}),(r=t.Segment||(t.Segment={})).CORE="core",r.VENDORS_DISCLOSED="vendorsDisclosed",r.VENDORS_ALLOWED="vendorsAllowed",r.PUBLISHER_TC="publisherTC"},function(e,t,n){"use strict";function r(e){for(var n in e)t.hasOwnProperty(n)||(t[n]=e[n])}Object.defineProperty(t,"__esModule",{value:!0}),r(n(39)),r(n(73)),r(n(120)),r(n(55)),r(n(35)),r(n(74)),r(n(75)),r(n(77)),r(n(76))},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(35),i=n(22),o=function(){function e(){}return e.encode=function(e,t){return r.IntEncoder.encode(Math.round(e.getTime()/100),t)},e.decode=function(e,t){if(t!==e.length)throw new i.DecodingError("invalid bit length");var n=new Date;return n.setTime(100*r.IntEncoder.decode(e,t)),n},e}();t.DateEncoder=o},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(35),i=n(22),o=function(){function e(){}return e.encode=function(e,t){var n=(e=e.toUpperCase()).charCodeAt(0)-65,o=e.charCodeAt(1)-65;if(n<0||n>25||o<0||o>25)throw new i.EncodingError("invalid language code: "+e);if(t%2==1)throw new i.EncodingError("numBits must be even, "+t+" is not valid");return t/=2,r.IntEncoder.encode(n,t)+r.IntEncoder.encode(o,t)},e.decode=function(e,t){if(t!==e.length||e.length%2)throw new i.DecodingError("invalid bit length for language");var n=e.length/2,o=r.IntEncoder.decode(e.slice(0,n),n)+65,s=r.IntEncoder.decode(e.slice(n),n)+65;return String.fromCharCode(o)+String.fromCharCode(s)},e}();t.LangEncoder=o},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(53),i=n(39),o=n(22),s=n(35),a=n(23),c=function(){function e(){}return e.encode=function(e){var t=s.IntEncoder.encode(e.numRestrictions,r.BitLength.numRestrictions);return e.isEmpty()||e.getRestrictions().forEach((function(n){t+=s.IntEncoder.encode(n.purposeId,r.BitLength.purposeId),t+=s.IntEncoder.encode(n.restrictionType,r.BitLength.restrictionType);for(var o=e.getVendors(n),a=o.length,c=0,u=0,p="",l=function(t){var n=o[t];0===u&&(c++,u=n);var l=o[a-1],f=e.gvl.vendorIds;if(t===a-1||o[t+1]>function(e){for(;++e<=l&&!f.has(e););return e}(n)){var d=!(n===u);p+=i.BooleanEncoder.encode(d),p+=s.IntEncoder.encode(u,r.BitLength.vendorId),d&&(p+=s.IntEncoder.encode(n,r.BitLength.vendorId)),u=0}},f=0;f<a;f++)l(f);t+=s.IntEncoder.encode(c,r.BitLength.numEntries),t+=p})),t},e.decode=function(e){var t=0,n=new a.PurposeRestrictionVector,c=s.IntEncoder.decode(e.substr(t,r.BitLength.numRestrictions),r.BitLength.numRestrictions);t+=r.BitLength.numRestrictions;for(var u=0;u<c;u++){var p=s.IntEncoder.decode(e.substr(t,r.BitLength.purposeId),r.BitLength.purposeId);t+=r.BitLength.purposeId;var l=s.IntEncoder.decode(e.substr(t,r.BitLength.restrictionType),r.BitLength.restrictionType);t+=r.BitLength.restrictionType;var f=new a.PurposeRestriction(p,l),d=s.IntEncoder.decode(e.substr(t,r.BitLength.numEntries),r.BitLength.numEntries);t+=r.BitLength.numEntries;for(var v=0;v<d;v++){var h=i.BooleanEncoder.decode(e.substr(t,r.BitLength.anyBoolean));t+=r.BitLength.anyBoolean;var g=s.IntEncoder.decode(e.substr(t,r.BitLength.vendorId),r.BitLength.vendorId);if(t+=r.BitLength.vendorId,h){var b=s.IntEncoder.decode(e.substr(t,r.BitLength.vendorId),r.BitLength.vendorId);if(t+=r.BitLength.vendorId,b<g)throw new o.DecodingError("Invalid RangeEntry: endVendorId "+b+" is less than "+g);for(var y=g;y<=b;y++)n.add(y,f)}else n.add(g,f)}}return n.bitLength=t,n},e}();t.PurposeRestrictionVectorEncoder=c},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(23),i=n(52),o=n(35),s=n(39),a=n(55),c=n(77),u=n(22),p=function(){function e(){}return e.encode=function(e){var t,n=[],r=[],a=o.IntEncoder.encode(e.maxId,i.BitLength.maxId),u="",p=i.BitLength.maxId+i.BitLength.encodingType,l=p+e.maxId,f=2*i.BitLength.vendorId+i.BitLength.singleOrRange+i.BitLength.numEntries,d=p+i.BitLength.numEntries;return e.forEach((function(o,a){u+=s.BooleanEncoder.encode(o),(t=e.maxId>f&&d<l)&&o&&(e.has(a+1)?0===r.length&&(r.push(a),d+=i.BitLength.singleOrRange,d+=i.BitLength.vendorId):(r.push(a),d+=i.BitLength.vendorId,n.push(r),r=[]))})),t?(a+=c.VectorEncodingType.RANGE+"",a+=this.buildRangeEncoding(n)):(a+=c.VectorEncodingType.FIELD+"",a+=u),a},e.decode=function(e,t){var n,p=0,l=o.IntEncoder.decode(e.substr(p,i.BitLength.maxId),i.BitLength.maxId);p+=i.BitLength.maxId;var f=o.IntEncoder.decode(e.charAt(p),i.BitLength.encodingType);if(p+=i.BitLength.encodingType,f===c.VectorEncodingType.RANGE){if(n=new r.Vector,1===t){if("1"===e.substr(p,1))throw new u.DecodingError("Unable to decode default consent=1");p++}var d=o.IntEncoder.decode(e.substr(p,i.BitLength.numEntries),i.BitLength.numEntries);p+=i.BitLength.numEntries;for(var v=0;v<d;v++){var h=s.BooleanEncoder.decode(e.charAt(p));p+=i.BitLength.singleOrRange;var g=o.IntEncoder.decode(e.substr(p,i.BitLength.vendorId),i.BitLength.vendorId);if(p+=i.BitLength.vendorId,h){var b=o.IntEncoder.decode(e.substr(p,i.BitLength.vendorId),i.BitLength.vendorId);p+=i.BitLength.vendorId;for(var y=g;y<=b;y++)n.set(y)}else n.set(g)}}else{var m=e.substr(p,l);p+=l,n=a.FixedVectorEncoder.decode(m,l)}return n.bitLength=p,n},e.buildRangeEncoding=function(e){var t=e.length,n=o.IntEncoder.encode(t,i.BitLength.numEntries);return e.forEach((function(e){var t=1===e.length;n+=s.BooleanEncoder.encode(!t),n+=o.IntEncoder.encode(e[0],i.BitLength.vendorId),t||(n+=o.IntEncoder.encode(e[1],i.BitLength.vendorId))})),n},e}();t.VendorVectorEncoder=p},function(e,t,n){"use strict";var r;Object.defineProperty(t,"__esModule",{value:!0}),(r=t.VectorEncodingType||(t.VectorEncodingType={}))[r.FIELD=0]="FIELD",r[r.RANGE=1]="RANGE"},function(e,t,n){"use strict";function r(e){for(var n in e)t.hasOwnProperty(n)||(t[n]=e[n])}Object.defineProperty(t,"__esModule",{value:!0}),r(n(121)),r(n(122))},function(e,t,n){"use strict";var r,i=this&&this.__extends||(r=function(e,t){return(r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}r(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)}),o=this&&this.__awaiter||function(e,t,n,r){return new(n||(n=Promise))((function(i,o){function s(e){try{c(r.next(e))}catch(e){o(e)}}function a(e){try{c(r.throw(e))}catch(e){o(e)}}function c(e){var t;e.done?i(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(s,a)}c((r=r.apply(e,t||[])).next())}))},s=this&&this.__generator||function(e,t){var n,r,i,o,s={label:0,sent:function(){if(1&i[0])throw i[1];return i[1]},trys:[],ops:[]};return o={next:a(0),throw:a(1),return:a(2)},"function"==typeof Symbol&&(o[Symbol.iterator]=function(){return this}),o;function a(o){return function(a){return function(o){if(n)throw new TypeError("Generator is already executing.");for(;s;)try{if(n=1,r&&(i=2&o[0]?r.return:o[0]?r.throw||((i=r.return)&&i.call(r),0):r.next)&&!(i=i.call(r,o[1])).done)return i;switch(r=0,i&&(o=[2&o[0],i.value]),o[0]){case 0:case 1:i=o;break;case 4:return s.label++,{value:o[1],done:!1};case 5:s.label++,r=o[1],o=[0];continue;case 7:o=s.ops.pop(),s.trys.pop();continue;default:if(!((i=(i=s.trys).length>0&&i[i.length-1])||6!==o[0]&&2!==o[0])){s=0;continue}if(3===o[0]&&(!i||o[1]>i[0]&&o[1]<i[3])){s.label=o[1];break}if(6===o[0]&&s.label<i[1]){s.label=i[1],i=o;break}if(i&&s.label<i[2]){s.label=i[2],s.ops.push(o);break}i[2]&&s.ops.pop(),s.trys.pop();continue}o=t.call(e,s)}catch(e){o=[6,e],r=0}finally{n=i=0}if(5&o[0])throw o[1];return{value:o[0]?o[1]:void 0,done:!0}}([o,a])}}};Object.defineProperty(t,"__esModule",{value:!0});var a=n(34),c=n(22),u=n(80),p=n(23),l=function(e){function t(n){var r=e.call(this)||this;r.isReady_=!1,r.isLatest=!1;var i=t.baseUrl;if(r.lang_=t.DEFAULT_LANGUAGE,r.isVendorList(n))r.populate(n),r.readyPromise=Promise.resolve();else{if(!i)throw new c.GVLError("must specify GVL.baseUrl before loading GVL json");if(n>0){var o=n;t.CACHE.has(o)?(r.populate(t.CACHE.get(o)),r.readyPromise=Promise.resolve()):(i+=t.versionedFilename.replace("[VERSION]",o+""),r.readyPromise=r.fetchJson(i))}else t.CACHE.has(t.LATEST_CACHE_KEY)?(r.populate(t.CACHE.get(t.LATEST_CACHE_KEY)),r.readyPromise=Promise.resolve()):(r.isLatest=!0,r.readyPromise=r.fetchJson(i+t.latestFilename))}return r}return i(t,e),Object.defineProperty(t,"baseUrl",{get:function(){return this.baseUrl_},set:function(e){if(/^https?:\/\/vendorlist\.consensu\.org\//.test(e))throw new c.GVLError("Invalid baseUrl!  You may not pull directly from vendorlist.consensu.org and must provide your own cache");e.length>0&&"/"!==e[e.length-1]&&(e+="/"),this.baseUrl_=e},enumerable:!0,configurable:!0}),t.emptyLanguageCache=function(e){var n=!1;return void 0===e&&t.LANGUAGE_CACHE.size>0?(t.LANGUAGE_CACHE=new Map,n=!0):"string"==typeof e&&this.consentLanguages.has(e.toUpperCase())&&(t.LANGUAGE_CACHE.delete(e.toUpperCase()),n=!0),n},t.emptyCache=function(e){var n=!1;return Number.isInteger(e)&&e>=0?(t.CACHE.delete(e),n=!0):void 0===e&&(t.CACHE=new Map,n=!0),n},t.prototype.cacheLanguage=function(){t.LANGUAGE_CACHE.has(this.lang_)||t.LANGUAGE_CACHE.set(this.lang_,{purposes:this.purposes,specialPurposes:this.specialPurposes,features:this.features,specialFeatures:this.specialFeatures,stacks:this.stacks})},t.prototype.fetchJson=function(e){return o(this,void 0,void 0,(function(){var t,n;return s(this,(function(r){switch(r.label){case 0:return r.trys.push([0,2,,3]),t=this.populate,[4,u.Json.fetch(e)];case 1:return t.apply(this,[r.sent()]),[3,3];case 2:throw n=r.sent(),new c.GVLError(n.message);case 3:return[2]}}))}))},t.prototype.getJson=function(){return JSON.parse(JSON.stringify({gvlSpecificationVersion:this.gvlSpecificationVersion,vendorListVersion:this.vendorListVersion,tcfPolicyVersion:this.tcfPolicyVersion,lastUpdated:this.lastUpdated,purposes:this.purposes,specialPurposes:this.specialPurposes,features:this.features,specialFeatures:this.specialFeatures,stacks:this.stacks,vendors:this.fullVendorList}))},t.prototype.changeLanguage=function(e){return o(this,void 0,void 0,(function(){var n,r,i,o,a;return s(this,(function(s){switch(s.label){case 0:if(n=e.toUpperCase(),!t.consentLanguages.has(n))return[3,6];if(n===this.lang_)return[3,5];if(this.lang_=n,!t.LANGUAGE_CACHE.has(n))return[3,1];for(i in r=t.LANGUAGE_CACHE.get(n))r.hasOwnProperty(i)&&(this[i]=r[i]);return[3,5];case 1:o=t.baseUrl+t.languageFilename.replace("[LANG]",e),s.label=2;case 2:return s.trys.push([2,4,,5]),[4,this.fetchJson(o)];case 3:return s.sent(),this.cacheLanguage(),[3,5];case 4:throw a=s.sent(),new c.GVLError("unable to load language: "+a.message);case 5:return[3,7];case 6:throw new c.GVLError("unsupported language "+e);case 7:return[2]}}))}))},Object.defineProperty(t.prototype,"language",{get:function(){return this.lang_},enumerable:!0,configurable:!0}),t.prototype.isVendorList=function(e){return void 0!==e&&void 0!==e.vendors},t.prototype.populate=function(e){this.purposes=e.purposes,this.specialPurposes=e.specialPurposes,this.features=e.features,this.specialFeatures=e.specialFeatures,this.stacks=e.stacks,this.isVendorList(e)&&(this.gvlSpecificationVersion=e.gvlSpecificationVersion,this.tcfPolicyVersion=e.tcfPolicyVersion,this.vendorListVersion=e.vendorListVersion,this.lastUpdated=e.lastUpdated,"string"==typeof this.lastUpdated&&(this.lastUpdated=new Date(this.lastUpdated)),this.vendors_=e.vendors,this.fullVendorList=e.vendors,this.mapVendors(),this.isReady_=!0,this.isLatest&&t.CACHE.set(t.LATEST_CACHE_KEY,this.getJson()),t.CACHE.has(this.vendorListVersion)||t.CACHE.set(this.vendorListVersion,this.getJson())),this.cacheLanguage()},t.prototype.mapVendors=function(e){var t=this;this.byPurposeVendorMap={},this.bySpecialPurposeVendorMap={},this.byFeatureVendorMap={},this.bySpecialFeatureVendorMap={},Object.keys(this.purposes).forEach((function(e){t.byPurposeVendorMap[e]={legInt:new Set,consent:new Set,flexible:new Set}})),Object.keys(this.specialPurposes).forEach((function(e){t.bySpecialPurposeVendorMap[e]=new Set})),Object.keys(this.features).forEach((function(e){t.byFeatureVendorMap[e]=new Set})),Object.keys(this.specialFeatures).forEach((function(e){t.bySpecialFeatureVendorMap[e]=new Set})),Array.isArray(e)||(e=Object.keys(this.fullVendorList).map((function(e){return+e}))),this.vendorIds=new Set(e),this.vendors_=e.reduce((function(e,n){var r=t.vendors_[""+n];return r&&void 0===r.deletedDate&&(r.purposes.forEach((function(e){t.byPurposeVendorMap[e+""].consent.add(n)})),r.specialPurposes.forEach((function(e){t.bySpecialPurposeVendorMap[e+""].add(n)})),r.legIntPurposes.forEach((function(e){t.byPurposeVendorMap[e+""].legInt.add(n)})),r.flexiblePurposes&&r.flexiblePurposes.forEach((function(e){t.byPurposeVendorMap[e+""].flexible.add(n)})),r.features.forEach((function(e){t.byFeatureVendorMap[e+""].add(n)})),r.specialFeatures.forEach((function(e){t.bySpecialFeatureVendorMap[e+""].add(n)})),e[n]=r),e}),{})},t.prototype.getFilteredVendors=function(e,t,n,r){var i=this,o=e.charAt(0).toUpperCase()+e.slice(1),s={};return("purpose"===e&&n?this["by"+o+"VendorMap"][t+""][n]:this["by"+(r?"Special":"")+o+"VendorMap"][t+""]).forEach((function(e){s[e+""]=i.vendors[e+""]})),s},t.prototype.getVendorsWithConsentPurpose=function(e){return this.getFilteredVendors("purpose",e,"consent")},t.prototype.getVendorsWithLegIntPurpose=function(e){return this.getFilteredVendors("purpose",e,"legInt")},t.prototype.getVendorsWithFlexiblePurpose=function(e){return this.getFilteredVendors("purpose",e,"flexible")},t.prototype.getVendorsWithSpecialPurpose=function(e){return this.getFilteredVendors("purpose",e,void 0,!0)},t.prototype.getVendorsWithFeature=function(e){return this.getFilteredVendors("feature",e)},t.prototype.getVendorsWithSpecialFeature=function(e){return this.getFilteredVendors("feature",e,void 0,!0)},Object.defineProperty(t.prototype,"vendors",{get:function(){return this.vendors_},enumerable:!0,configurable:!0}),t.prototype.narrowVendorsTo=function(e){this.mapVendors(e)},Object.defineProperty(t.prototype,"isReady",{get:function(){return this.isReady_},enumerable:!0,configurable:!0}),t.prototype.clone=function(){return new t(this.getJson())},t.isInstanceOf=function(e){return"object"==typeof e&&"function"==typeof e.narrowVendorsTo},t.LANGUAGE_CACHE=new Map,t.CACHE=new Map,t.LATEST_CACHE_KEY=0,t.DEFAULT_LANGUAGE="EN",t.consentLanguages=new p.ConsentLanguages,t.latestFilename="vendor-list.json",t.versionedFilename="archives/vendor-list-v[VERSION].json",t.languageFilename="purposes-[LANG].json",t}(a.Cloneable);t.GVL=l},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=function(){function e(){}return e.absCall=function(e,t,n,r){return new Promise((function(i,o){var s=new XMLHttpRequest;s.withCredentials=n,s.addEventListener("load",(function(){if(s.readyState==XMLHttpRequest.DONE)if(s.status>=200&&s.status<300){var e=s.response;if("string"==typeof e)try{e=JSON.parse(e)}catch(e){}i(e)}else o(new Error("HTTP Status: "+s.status+" response type: "+s.responseType))})),s.addEventListener("error",(function(){o(new Error("error"))})),s.addEventListener("abort",(function(){o(new Error("aborted"))})),null===t?s.open("GET",e,!0):s.open("POST",e,!0),s.responseType="json",s.timeout=r,s.ontimeout=function(){o(new Error("Timeout "+r+"ms "+e))},s.send(t)}))},e.post=function(e,t,n,r){return void 0===n&&(n=!1),void 0===r&&(r=0),this.absCall(e,JSON.stringify(t),n,r)},e.fetch=function(e,t,n){return void 0===t&&(t=!1),void 0===n&&(n=0),this.absCall(e,null,t,n)},e}();t.Json=r},function(e,t,n){"use strict";var r,i=this&&this.__extends||(r=function(e,t){return(r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}r(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)});Object.defineProperty(t,"__esModule",{value:!0});var o=n(34),s=n(22),a=n(79),c=n(23),u=function(e){function t(t){var n=e.call(this)||this;return n.isServiceSpecific_=!1,n.supportOOB_=!0,n.useNonStandardStacks_=!1,n.purposeOneTreatment_=!1,n.publisherCountryCode_="AA",n.version_=2,n.consentScreen_=0,n.policyVersion_=2,n.consentLanguage_="EN",n.cmpId_=0,n.cmpVersion_=0,n.vendorListVersion_=0,n.numCustomPurposes_=0,n.specialFeatureOptins=new c.Vector,n.purposeConsents=new c.Vector,n.purposeLegitimateInterests=new c.Vector,n.publisherConsents=new c.Vector,n.publisherLegitimateInterests=new c.Vector,n.publisherCustomConsents=new c.Vector,n.publisherCustomLegitimateInterests=new c.Vector,n.vendorConsents=new c.Vector,n.vendorLegitimateInterests=new c.Vector,n.vendorsDisclosed=new c.Vector,n.vendorsAllowed=new c.Vector,n.publisherRestrictions=new c.PurposeRestrictionVector,t&&(n.gvl=t),n.created=new Date,n.updated(),n}return i(t,e),Object.defineProperty(t.prototype,"gvl",{get:function(){return this.gvl_},set:function(e){a.GVL.isInstanceOf(e)||(e=new a.GVL(e)),this.gvl_=e,this.publisherRestrictions.gvl=e},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"cmpId",{get:function(){return this.cmpId_},set:function(e){if(!(Number.isInteger(+e)&&e>1))throw new s.TCModelError("cmpId",e);this.cmpId_=+e},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"cmpVersion",{get:function(){return this.cmpVersion_},set:function(e){if(!(Number.isInteger(+e)&&e>-1))throw new s.TCModelError("cmpVersion",e);this.cmpVersion_=+e},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"consentScreen",{get:function(){return this.consentScreen_},set:function(e){if(!(Number.isInteger(+e)&&e>-1))throw new s.TCModelError("consentScreen",e);this.consentScreen_=+e},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"consentLanguage",{get:function(){return this.consentLanguage_},set:function(e){this.consentLanguage_=e},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"publisherCountryCode",{get:function(){return this.publisherCountryCode_},set:function(e){if(!/^([A-z]){2}$/.test(e))throw new s.TCModelError("publisherCountryCode",e);this.publisherCountryCode_=e.toUpperCase()},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"vendorListVersion",{get:function(){return this.gvl?this.gvl.vendorListVersion:this.vendorListVersion_},set:function(e){if((e=+e>>0)<0)throw new s.TCModelError("vendorListVersion",e);this.vendorListVersion_=e},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"policyVersion",{get:function(){return this.gvl?this.gvl.tcfPolicyVersion:this.policyVersion_},set:function(e){if(this.policyVersion_=parseInt(e,10),this.policyVersion_<0)throw new s.TCModelError("policyVersion",e)},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"version",{get:function(){return this.version_},set:function(e){this.version_=parseInt(e,10)},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"isServiceSpecific",{get:function(){return this.isServiceSpecific_},set:function(e){this.isServiceSpecific_=e},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"useNonStandardStacks",{get:function(){return this.useNonStandardStacks_},set:function(e){this.useNonStandardStacks_=e},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"supportOOB",{get:function(){return this.supportOOB_},set:function(e){this.supportOOB_=e},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"purposeOneTreatment",{get:function(){return this.purposeOneTreatment_},set:function(e){this.purposeOneTreatment_=e},enumerable:!0,configurable:!0}),t.prototype.setAllVendorConsents=function(){this.vendorConsents.set(this.gvl.vendors)},t.prototype.unsetAllVendorConsents=function(){this.vendorConsents.empty()},t.prototype.setAllVendorsDisclosed=function(){this.vendorsDisclosed.set(this.gvl.vendors)},t.prototype.unsetAllVendorsDisclosed=function(){this.vendorsDisclosed.empty()},t.prototype.setAllVendorsAllowed=function(){this.vendorsAllowed.set(this.gvl.vendors)},t.prototype.unsetAllVendorsAllowed=function(){this.vendorsAllowed.empty()},t.prototype.setAllVendorLegitimateInterests=function(){this.vendorLegitimateInterests.set(this.gvl.vendors)},t.prototype.unsetAllVendorLegitimateInterests=function(){this.vendorLegitimateInterests.empty()},t.prototype.setAllPurposeConsents=function(){this.purposeConsents.set(this.gvl.purposes)},t.prototype.unsetAllPurposeConsents=function(){this.purposeConsents.empty()},t.prototype.setAllPurposeLegitimateInterests=function(){this.purposeLegitimateInterests.set(this.gvl.purposes)},t.prototype.unsetAllPurposeLegitimateInterests=function(){this.purposeLegitimateInterests.empty()},t.prototype.setAllSpecialFeatureOptins=function(){this.specialFeatureOptins.set(this.gvl.specialFeatures)},t.prototype.unsetAllSpecialFeatureOptins=function(){this.specialFeatureOptins.empty()},t.prototype.setAll=function(){this.setAllVendorConsents(),this.setAllPurposeLegitimateInterests(),this.setAllSpecialFeatureOptins(),this.setAllPurposeConsents(),this.setAllVendorLegitimateInterests()},t.prototype.unsetAll=function(){this.unsetAllVendorConsents(),this.unsetAllPurposeLegitimateInterests(),this.unsetAllSpecialFeatureOptins(),this.unsetAllPurposeConsents(),this.unsetAllVendorLegitimateInterests()},Object.defineProperty(t.prototype,"numCustomPurposes",{get:function(){var e=this.numCustomPurposes_;if("object"==typeof this.customPurposes){var t=Object.keys(this.customPurposes).sort((function(e,t){return+e-+t}));e=parseInt(t.pop(),10)}return e},set:function(e){if(this.numCustomPurposes_=parseInt(e,10),this.numCustomPurposes_<0)throw new s.TCModelError("numCustomPurposes",e)},enumerable:!0,configurable:!0}),t.prototype.updated=function(){this.lastUpdated=new Date},t.consentLanguages=a.GVL.consentLanguages,t}(o.Cloneable);t.TCModel=u},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),function(e){for(var n in e)t.hasOwnProperty(n)||(t[n]=e[n])}(n(83))},function(e,t,n){"use strict";var r;Object.defineProperty(t,"__esModule",{value:!0}),(r=t.TCFCommand||(t.TCFCommand={})).PING="ping",r.GET_TC_DATA="getTCData",r.GET_IN_APP_TC_DATA="getInAppTCData",r.GET_VENDOR_LIST="getVendorList",r.ADD_EVENT_LISTENER="addEventListener",r.REMOVE_EVENT_LISTENER="removeEventListener"},function(e,t,n){"use strict";var r,i=this&&this.__extends||(r=function(e,t){return(r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}r(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)});Object.defineProperty(t,"__esModule",{value:!0});var o=n(43),s=n(44),a=function(e){function t(){var t=null!==e&&e.apply(this,arguments)||this;return t.cmpStatus=s.CmpStatus.ERROR,t}return i(t,e),t}(o.Response);t.Disabled=a},function(e,t,n){"use strict";var r,i=this&&this.__extends||(r=function(e,t){return(r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}r(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)}),o=this&&this.__read||function(e,t){var n="function"==typeof Symbol&&e[Symbol.iterator];if(!n)return e;var r,i,o=n.call(e),s=[];try{for(;(void 0===t||t-- >0)&&!(r=o.next()).done;)s.push(r.value)}catch(e){i={error:e}}finally{try{r&&!r.done&&(n=o.return)&&n.call(o)}finally{if(i)throw i.error}}return s},s=this&&this.__spread||function(){for(var e=[],t=0;t<arguments.length;t++)e=e.concat(o(arguments[t]));return e};Object.defineProperty(t,"__esModule",{value:!0});var a=n(32),c=function(e){function t(t,n){var r=e.call(this)||this;if(r.eventStatus=a.CmpApiModel.eventStatus,r.cmpStatus=a.CmpApiModel.cmpStatus,r.listenerId=n,a.CmpApiModel.gdprApplies){var i=a.CmpApiModel.tcModel;r.tcString=a.CmpApiModel.tcString,r.isServiceSpecific=i.isServiceSpecific,r.useNonStandardStacks=i.useNonStandardStacks,r.purposeOneTreatment=i.purposeOneTreatment,r.publisherCC=i.publisherCountryCode,r.outOfBand={allowedVendors:r.createVectorField(i.vendorsAllowed,t),disclosedVendors:r.createVectorField(i.vendorsDisclosed,t)},r.purpose={consents:r.createVectorField(i.purposeConsents),legitimateInterests:r.createVectorField(i.purposeLegitimateInterests)},r.vendor={consents:r.createVectorField(i.vendorConsents,t),legitimateInterests:r.createVectorField(i.vendorLegitimateInterests,t)},r.specialFeatureOptins=r.createVectorField(i.specialFeatureOptins),r.publisher={consents:r.createVectorField(i.publisherConsents),legitimateInterests:r.createVectorField(i.publisherLegitimateInterests),customPurpose:{consents:r.createVectorField(i.publisherCustomConsents),legitimateInterests:r.createVectorField(i.publisherCustomLegitimateInterests)},restrictions:r.createRestrictions(i.publisherRestrictions)}}return r}return i(t,e),t.prototype.createRestrictions=function(e){var t={};if(e.numRestrictions>0)for(var n=e.getMaxVendorId(),r=function(n){var r=n.toString();e.getRestrictions(n).forEach((function(e){var n=e.purposeId.toString();t[n]||(t[n]={}),t[n][r]=e.restrictionType}))},i=1;i<=n;i++)r(i);return t},t.prototype.createVectorField=function(e,t){return t?t.reduce((function(t,n){return t[n+""]=e.has(+n),t}),{}):s(e).reduce((function(e,t){return e[t[0].toString(10)]=t[1],e}),{})},t}(n(43).Response);t.TCData=c},function(e,t,n){"use strict";var r=this&&this.__read||function(e,t){var n="function"==typeof Symbol&&e[Symbol.iterator];if(!n)return e;var r,i,o=n.call(e),s=[];try{for(;(void 0===t||t-- >0)&&!(r=o.next()).done;)s.push(r.value)}catch(e){i={error:e}}finally{try{r&&!r.done&&(n=o.return)&&n.call(o)}finally{if(i)throw i.error}}return s},i=this&&this.__spread||function(){for(var e=[],t=0;t<arguments.length;t++)e=e.concat(r(arguments[t]));return e};Object.defineProperty(t,"__esModule",{value:!0});var o=n(82),s=n(132),a=n(32),c=n(84),u=n(138);t.API_KEY="__tcfapi";var p=function(){function e(e){var n,r,i;if(e){var s=o.TCFCommand.ADD_EVENT_LISTENER;if(null===(n=e)||void 0===n?void 0:n[s])throw new Error("Built-In Custom Commmand for "+s+" not allowed: Use "+o.TCFCommand.GET_TC_DATA+" instead");if(s=o.TCFCommand.REMOVE_EVENT_LISTENER,null===(r=e)||void 0===r?void 0:r[s])throw new Error("Built-In Custom Commmand for "+s+" not allowed");(null===(i=e)||void 0===i?void 0:i[o.TCFCommand.GET_TC_DATA])&&(e[o.TCFCommand.ADD_EVENT_LISTENER]=e[o.TCFCommand.GET_TC_DATA]),this.customCommands=e}try{this.callQueue=window[t.API_KEY]()||[]}catch(e){this.callQueue=[]}finally{window[t.API_KEY]=this.apiCall.bind(this),this.purgeQueuedCalls()}}return e.prototype.apiCall=function(e,t,n){for(var r,p=[],l=3;l<arguments.length;l++)p[l-3]=arguments[l];if("string"!=typeof e)n(null,!1);else if(u.SupportedVersions.has(t)){if("function"!=typeof n)throw new Error("invalid callback function");a.CmpApiModel.disabled?n(new c.Disabled,!1):this.isCustomCommand(e)||this.isBuiltInCommand(e)?this.isCustomCommand(e)&&!this.isBuiltInCommand(e)?(r=this.customCommands)[e].apply(r,i([n],p)):e===o.TCFCommand.PING?this.isCustomCommand(e)?new s.CommandMap[e](this.customCommands[e],p[0],null,n):new s.CommandMap[e](n,p[0]):void 0===a.CmpApiModel.tcModel?this.callQueue.push(i([e,t,n],p)):this.isCustomCommand(e)&&this.isBuiltInCommand(e)?new s.CommandMap[e](this.customCommands[e],p[0],null,n):new s.CommandMap[e](n,p[0]):n(null,!1)}else n(null,!1)},e.prototype.purgeQueuedCalls=function(){var e=this.callQueue;this.callQueue=[],e.forEach((function(e){window[t.API_KEY].apply(window,i(e))}))},e.prototype.isCustomCommand=function(e){return this.customCommands&&"function"==typeof this.customCommands[e]},e.prototype.isBuiltInCommand=function(e){return void 0!==s.CommandMap[e]},e}();t.CallResponder=p},function(e,t,n){"use strict";(function(e){var n=setTimeout;function r(){}function i(e){if(!(this instanceof i))throw new TypeError("Promises must be constructed via new");if("function"!=typeof e)throw new TypeError("not a function");this._state=0,this._handled=!1,this._value=void 0,this._deferreds=[],p(e,this)}function o(e,t){for(;3===e._state;)e=e._value;0!==e._state?(e._handled=!0,i._immediateFn((function(){var n=1===e._state?t.onFulfilled:t.onRejected;if(null!==n){var r;try{r=n(e._value)}catch(e){return void a(t.promise,e)}s(t.promise,r)}else(1===e._state?s:a)(t.promise,e._value)}))):e._deferreds.push(t)}function s(e,t){try{if(t===e)throw new TypeError("A promise cannot be resolved with itself.");if(t&&("object"==typeof t||"function"==typeof t)){var n=t.then;if(t instanceof i)return e._state=3,e._value=t,void c(e);if("function"==typeof n)return void p((r=n,o=t,function(){r.apply(o,arguments)}),e)}e._state=1,e._value=t,c(e)}catch(t){a(e,t)}var r,o}function a(e,t){e._state=2,e._value=t,c(e)}function c(e){2===e._state&&0===e._deferreds.length&&i._immediateFn((function(){e._handled||i._unhandledRejectionFn(e._value)}));for(var t=0,n=e._deferreds.length;t<n;t++)o(e,e._deferreds[t]);e._deferreds=null}function u(e,t,n){this.onFulfilled="function"==typeof e?e:null,this.onRejected="function"==typeof t?t:null,this.promise=n}function p(e,t){var n=!1;try{e((function(e){n||(n=!0,s(t,e))}),(function(e){n||(n=!0,a(t,e))}))}catch(e){if(n)return;n=!0,a(t,e)}}i.prototype.catch=function(e){return this.then(null,e)},i.prototype.then=function(e,t){var n=new this.constructor(r);return o(this,new u(e,t,n)),n},i.prototype.finally=function(e){var t=this.constructor;return this.then((function(n){return t.resolve(e()).then((function(){return n}))}),(function(n){return t.resolve(e()).then((function(){return t.reject(n)}))}))},i.all=function(e){return new i((function(t,n){if(!e||void 0===e.length)throw new TypeError("Promise.all accepts an array");var r=Array.prototype.slice.call(e);if(0===r.length)return t([]);var i=r.length;function o(e,s){try{if(s&&("object"==typeof s||"function"==typeof s)){var a=s.then;if("function"==typeof a)return void a.call(s,(function(t){o(e,t)}),n)}r[e]=s,0==--i&&t(r)}catch(e){n(e)}}for(var s=0;s<r.length;s++)o(s,r[s])}))},i.resolve=function(e){return e&&"object"==typeof e&&e.constructor===i?e:new i((function(t){t(e)}))},i.reject=function(e){return new i((function(t,n){n(e)}))},i.race=function(e){return new i((function(t,n){for(var r=0,i=e.length;r<i;r++)e[r].then(t,n)}))},i._immediateFn="function"==typeof e&&function(t){e(t)}||function(e){n(e,0)},i._unhandledRejectionFn=function(e){"undefined"!=typeof console&&console&&console.warn("Possible Unhandled Promise Rejection:",e)},t.a=i}).call(this,n(57).setImmediate)},function(e,t,n){"use strict";var r=function(){return(r=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var i in t=arguments[n])Object.prototype.hasOwnProperty.call(t,i)&&(e[i]=t[i]);return e}).apply(this,arguments)};e.exports=function(e,t){void 0===e&&(e={}),void 0===t&&(t=null);var n=e||{},i=[];function o(){i.forEach((function(e){return e(n)}))}return{middleware:t,setState:function(e){n=r({},n,"function"==typeof e?e(n):e),o()},subscribe:function(e){return i.push(e),function(){i.splice(i.indexOf(e),1)}},getState:function(){return n},reset:function(){n=e,o()}}}},function(e,t,n){"use strict";var r=Array.isArray,i=Object.keys,o=Object.prototype.hasOwnProperty;e.exports=function e(t,n){if(t===n)return!0;var s,a,c,u=r(t),p=r(n);if(u&&p){if((a=t.length)!=n.length)return!1;for(s=0;s<a;s++)if(!e(t[s],n[s]))return!1;return!0}if(u!=p)return!1;var l=t instanceof Date,f=n instanceof Date;if(l!=f)return!1;if(l&&f)return t.getTime()==n.getTime();var d=t instanceof RegExp,v=n instanceof RegExp;if(d!=v)return!1;if(d&&v)return t.toString()==n.toString();if(t instanceof Object&&n instanceof Object){var h=i(t);if((a=h.length)!==i(n).length)return!1;for(s=0;s<a;s++)if(!o.call(n,h[s]))return!1;for(s=0;s<a;s++)if(!e(t[c=h[s]],n[c]))return!1;return!0}return!1}},function(e,t,n){var r=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}();var i=n(33),o=function(){function e(t){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),t=t||{},this.issuer=t.issuer||null,this.user_id=t.user_id||null,this.user_id_type=t.user_id_type||null,this.user_id_hash_method=t.user_id_hash_method||null,this.consents=t.consents||[],this.version=1}return r(e,[{key:"toObject",value:function(){return{issuer:this.issuer,user_id:this.user_id,user_id_type:this.user_id_type,user_id_hash_method:this.user_id_hash_method,consents:this.consents,version:this.version}}},{key:"toJSON",value:function(){return JSON.stringify(this.toObject())}},{key:"toCompressedJSON",value:function(){var e=this.toObject(),t={issuer:e.issuer,user_id:e.user_id,user_id_type:e.user_id_type,user_id_hash_method:e.user_id_hash_method,version:e.version,purposes:{enabled:[],disabled:[]},vendors:{enabled:[],disabled:[]}},n={},r={};for(var i in e.consents)if(e.consents.hasOwnProperty(i)){var o=e.consents[i],s=o.purpose,a=o.vendors;r[s]={};var c=!0;for(var u in a)if(a.hasOwnProperty(u)){var p=a[u];c=c&&!1===p.status,n[p.id]||(n[p.id]={id:p.id,purposes:{}}),n[p.id].purposes[s]=p.status,r[s][p.id]=p.status}c?t.purposes.disabled.push(s):t.purposes.enabled.push(s)}var l=Object.keys(n);for(var f in l)if(l.hasOwnProperty(f)){var d=l[f],v=!0;for(var h in t.purposes.enabled)if(t.purposes.enabled.hasOwnProperty(h)){var g=t.purposes.enabled[h];v=v&&!0===n[d].purposes[g]}v?t.vendors.enabled.push(n[d].id):t.vendors.disabled.push(n[d].id)}return JSON.stringify(t)}},{key:"toBase64",value:function(){return i.encode(this.toJSON())}},{key:"toCompressedBase64",value:function(){return i.encode(this.toCompressedJSON())}},{key:"setConsentStatus",value:function(e,t,n){var r=this.consents.find((function(e){return e.purpose===t}));r||(r={purpose:t,vendors:[]},this.consents.push(r));var i=r.vendors.find((function(e){return e.id===n}));i||(i={id:n,status:void 0},r.vendors.push(i)),i.status=e}},{key:"getConsentStatus",value:function(e,t){var n=this.consents.find((function(t){return t.purpose===e}));if(n){var r=n.vendors.find((function(e){return e.id===t}));if(r)return r.status;var i=n.vendors.find((function(e){return"*"===e.id}));if(i)return i.status}}}]),e}();function s(e){if(!e)return null;var t=void 0;try{t=JSON.parse(e)}catch(e){return null}return t.purposes||t.vendors?null:new o(t)}function a(e){if(!e)return null;var t=void 0;try{t=JSON.parse(e)}catch(e){return null}if(t.consents||!t.purposes||!t.vendors||!t.purposes.enabled||!t.purposes.disabled||!t.vendors.enabled||!t.vendors.disabled)return null;var n=new o({issuer:t.issuer,user_id:t.user_id,user_id_type:t.user_id_type,user_id_hash_method:t.user_id_hash_method,consents:[],version:t.version});for(var r in t.purposes.enabled)if(t.purposes.enabled.hasOwnProperty(r)){var i=t.purposes.enabled[r];for(var s in t.vendors.enabled)if(t.vendors.enabled.hasOwnProperty(s)){var a=t.vendors.enabled[s];n.setConsentStatus(!0,i,a)}for(var c in t.vendors.disabled)if(t.vendors.disabled.hasOwnProperty(c)){var u=t.vendors.disabled[c];n.setConsentStatus(!1,i,u)}}for(var p in t.purposes.disabled)if(t.purposes.disabled.hasOwnProperty(p)){var l=t.purposes.disabled[p];for(var f in t.vendors.enabled)if(t.vendors.enabled.hasOwnProperty(f)){var d=t.vendors.enabled[f];n.setConsentStatus(!1,l,d)}for(var v in t.vendors.disabled)if(t.vendors.disabled.hasOwnProperty(v)){var h=t.vendors.disabled[v];n.setConsentStatus(!1,l,h)}}return n}e.exports={CWT:o,CWTFromBase64:function(e){if(!e)return null;try{return s(i.decode(e))}catch(e){return null}},CWTFromCompressedBase64:function(e){if(!e)return null;try{return a(i.decode(e))}catch(e){return null}},CWTFromJSON:s,CWTFromCompressedJSON:a,Purposes:{Cookies:"cookies",CookiesAnalytics:"cookies_analytics",CookiesMarketing:"cookies_marketing",CookiesSocial:"cookies_social",AdvertisingPersonalization:"advertising_personalization",Analytics:"analytics",ContentPersonalization:"content_personalization",DeviceAccess:"device_access",OfflineMatch:"offline_match",LinkDevices:"link_devices",PreciseGeo:"precise_geo"}}},function(e,t,n){"use strict";function r(e){for(var n in e)t.hasOwnProperty(n)||(t[n]=e[n])}Object.defineProperty(t,"__esModule",{value:!0}),r(n(82)),r(n(42)),r(n(44)),r(n(131));var i=n(86);t.API_KEY=i.API_KEY},function(e,t,n){e.exports=n(139)},function(e,t,n){"use strict";(function(e){var t=n(87),r=function(){if("undefined"!=typeof self)return self;if("undefined"!=typeof window)return window;if(void 0!==e)return e;throw new Error("unable to locate global object")}();r.Promise||(r.Promise=t.a)}).call(this,n(38))},function(e,t,n){(function(e,t){!function(e,n){"use strict";if(!e.setImmediate){var r,i,o,s,a,c=1,u={},p=!1,l=e.document,f=Object.getPrototypeOf&&Object.getPrototypeOf(e);f=f&&f.setTimeout?f:e,"[object process]"==={}.toString.call(e.process)?r=function(e){t.nextTick((function(){v(e)}))}:!function(){if(e.postMessage&&!e.importScripts){var t=!0,n=e.onmessage;return e.onmessage=function(){t=!1},e.postMessage("","*"),e.onmessage=n,t}}()?e.MessageChannel?((o=new MessageChannel).port1.onmessage=function(e){v(e.data)},r=function(e){o.port2.postMessage(e)}):l&&"onreadystatechange"in l.createElement("script")?(i=l.documentElement,r=function(e){var t=l.createElement("script");t.onreadystatechange=function(){v(e),t.onreadystatechange=null,i.removeChild(t),t=null},i.appendChild(t)}):r=function(e){setTimeout(v,0,e)}:(s="setImmediate$"+Math.random()+"$",a=function(t){t.source===e&&"string"==typeof t.data&&0===t.data.indexOf(s)&&v(+t.data.slice(s.length))},e.addEventListener?e.addEventListener("message",a,!1):e.attachEvent("onmessage",a),r=function(t){e.postMessage(s+t,"*")}),f.setImmediate=function(e){"function"!=typeof e&&(e=new Function(""+e));for(var t=new Array(arguments.length-1),n=0;n<t.length;n++)t[n]=arguments[n+1];var i={callback:e,args:t};return u[c]=i,r(c),c++},f.clearImmediate=d}function d(e){delete u[e]}function v(e){if(p)setTimeout(v,0,e);else{var t=u[e];if(t){p=!0;try{!function(e){var t=e.callback,n=e.args;switch(n.length){case 0:t();break;case 1:t(n[0]);break;case 2:t(n[0],n[1]);break;case 3:t(n[0],n[1],n[2]);break;default:t.apply(void 0,n)}}(t)}finally{d(e),p=!1}}}}}("undefined"==typeof self?void 0===e?this:e:self)}).call(this,n(38),n(95))},function(e,t){var n,r,i=e.exports={};function o(){throw new Error("setTimeout has not been defined")}function s(){throw new Error("clearTimeout has not been defined")}function a(e){if(n===setTimeout)return setTimeout(e,0);if((n===o||!n)&&setTimeout)return n=setTimeout,setTimeout(e,0);try{return n(e,0)}catch(t){try{return n.call(null,e,0)}catch(t){return n.call(this,e,0)}}}!function(){try{n="function"==typeof setTimeout?setTimeout:o}catch(e){n=o}try{r="function"==typeof clearTimeout?clearTimeout:s}catch(e){r=s}}();var c,u=[],p=!1,l=-1;function f(){p&&c&&(p=!1,c.length?u=c.concat(u):l=-1,u.length&&d())}function d(){if(!p){var e=a(f);p=!0;for(var t=u.length;t;){for(c=u,u=[];++l<t;)c&&c[l].run();l=-1,t=u.length}c=null,p=!1,function(e){if(r===clearTimeout)return clearTimeout(e);if((r===s||!r)&&clearTimeout)return r=clearTimeout,clearTimeout(e);try{r(e)}catch(t){try{return r.call(null,e)}catch(t){return r.call(this,e)}}}(e)}}function v(e,t){this.fun=e,this.array=t}function h(){}i.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)t[n-1]=arguments[n];u.push(new v(e,t)),1!==u.length||p||a(d)},v.prototype.run=function(){this.fun.apply(null,this.array)},i.title="browser",i.browser=!0,i.env={},i.argv=[],i.version="",i.versions={},i.on=h,i.addListener=h,i.once=h,i.off=h,i.removeListener=h,i.removeAllListeners=h,i.emit=h,i.prependListener=h,i.prependOnceListener=h,i.listeners=function(e){return[]},i.binding=function(e){throw new Error("process.binding is not supported")},i.cwd=function(){return"/"},i.chdir=function(e){throw new Error("process.chdir is not supported")},i.umask=function(){return 0}},function(e,t,n){"use strict";function r(e,t){if(null!=t){if(t.then)return t.then(e.setState);e.setState(t)}}Object.defineProperty(t,"__esModule",{value:!0});var i=function(e,t){return function(n){return r(e,n.apply(void 0,[e.getState()].concat(t)))}};t.applyMiddleware=function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];return e.reverse(),function(t,n,o){return e.length<1?r(t,n.apply(void 0,[t.getState()].concat(o))):e.map((function(e){return e(t)})).reduce((function(e,t){return t(e,o)}),i(t,o))(n)}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r={instance:null},i=[];function o(e,t){var n=JSON.parse(t.state),r=Object.keys(n.actionsById).filter((function(e){return parseInt(e,10)<=t.payload.id})),o=0;setTimeout((function t(){!function(t){if("initialState"===t.type)e.setState(n.computedStates[0].state);else{var r=i.find((function(e){return t.type===e.key}));r&&r.fn()}}(n.actionsById[r[o]].action),++o>=r.length||setTimeout(t,10)}),0)}function s(e){"DISPATCH"===e.type&&("JUMP_TO_ACTION"===e.payload.type||"JUMP_TO_STATE"===e.payload.type?this.setState(JSON.parse(e.state)):"TOGGLE_ACTION"===e.payload.type&&o(this,e))}function a(e,t){if(!t.initialized){var n=s.bind(e);r.instance&&r.instance.subscribe(n),t.initialized=!0}}var c=function(e){return function(t,n){return function(o){var s=t(o);a(e,c),function(e,t){var n=i.find((function(t){return e.name===t.key}));n||(n={key:e.name,fn:t},i.push(n))}(o,(function(){return t(o)}));var u={type:o.name,args:n};return s&&s.then?s.then((function(){return r.instance&&r.instance.send(u,e.getState())})):(r.instance&&r.instance.send(u,e.getState()),s)}}};"object"==typeof window&&window.__REDUX_DEVTOOLS_EXTENSION__&&(t.connect=function(e,t){return r.instance=window.__REDUX_DEVTOOLS_EXTENSION__.connect(t),r.instance&&r.instance.send("initialState",e),c})},function(e,t,n){var r=n(59);e.exports=function(e){if(Array.isArray(e))return r(e)},e.exports.__esModule=!0,e.exports.default=e.exports},function(e,t){e.exports=function(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)},e.exports.__esModule=!0,e.exports.default=e.exports},function(e,t){e.exports=function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")},e.exports.__esModule=!0,e.exports.default=e.exports},function(e,t){function n(t,r){return e.exports=n=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e},e.exports.__esModule=!0,e.exports.default=e.exports,n(t,r)}e.exports=n,e.exports.__esModule=!0,e.exports.default=e.exports},function(e,t){e.exports=function(e){if(Array.isArray(e))return e},e.exports.__esModule=!0,e.exports.default=e.exports},function(e,t){e.exports=function(e,t){var n=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null!=n){var r,i,o=[],s=!0,a=!1;try{for(n=n.call(e);!(s=(r=n.next()).done)&&(o.push(r.value),!t||o.length!==t);s=!0);}catch(e){a=!0,i=e}finally{try{s||null==n.return||n.return()}finally{if(a)throw i}}return o}},e.exports.__esModule=!0,e.exports.default=e.exports},function(e,t){e.exports=function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")},e.exports.__esModule=!0,e.exports.default=e.exports},function(e,t){e.exports=function(e){return e.webpackPolyfill||(e.deprecate=function(){},e.paths=[],e.children||(e.children=[]),Object.defineProperty(e,"loaded",{enumerable:!0,get:function(){return e.l}}),Object.defineProperty(e,"id",{enumerable:!0,get:function(){return e.i}}),e.webpackPolyfill=1),e}},function(e,t,n){var r=n(2);e.exports=function(e,t){for(;!Object.prototype.hasOwnProperty.call(e,t)&&null!==(e=r(e)););return e},e.exports.__esModule=!0,e.exports.default=e.exports},function(e,t,n){"use strict";var r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},i=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}();function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var s=n(62),a=s.encodeConsentString,c=s.getMaxVendorId,u=s.encodeVendorIdsToBits,p=s.encodePurposeIdsToBits,l=n(65).decodeConsentString,f=n(64).vendorVersionMap,d=/^[a-z]{2}$/,v=function(){function e(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;o(this,e),this.created=new Date,this.lastUpdated=new Date,this.version=1,this.vendorList=null,this.vendorListVersion=null,this.cmpId=null,this.cmpVersion=null,this.consentScreen=null,this.consentLanguage=null,this.allowedPurposeIds=[],this.allowedVendorIds=[],t&&Object.assign(this,l(t))}return i(e,[{key:"getConsentString",value:function(){var e=!(arguments.length>0&&void 0!==arguments[0])||arguments[0];if(!this.vendorList)throw new Error("ConsentString - A vendor list is required to encode a consent string");return!0===e&&(this.lastUpdated=new Date),a({version:this.getVersion(),vendorList:this.vendorList,allowedPurposeIds:this.allowedPurposeIds,allowedVendorIds:this.allowedVendorIds,created:this.created,lastUpdated:this.lastUpdated,cmpId:this.cmpId,cmpVersion:this.cmpVersion,consentScreen:this.consentScreen,consentLanguage:this.consentLanguage,vendorListVersion:this.vendorListVersion})}},{key:"getMaxVendorId",value:function(){return c(this.vendorList.vendors)}},{key:"getParsedVendorConsents",value:function(){return u(c(this.vendorList.vendors),this.allowedVendorIds)}},{key:"getParsedPurposeConsents",value:function(){return p(this.vendorList.purposes,this.allowedPurposeIds)}},{key:"getMetadataString",value:function(){return a({version:this.getVersion(),created:this.created,lastUpdated:this.lastUpdated,cmpId:this.cmpId,cmpVersion:this.cmpVersion,consentScreen:this.consentScreen,vendorListVersion:this.vendorListVersion})}},{key:"getVersion",value:function(){return this.version}},{key:"getVendorListVersion",value:function(){return this.vendorListVersion}},{key:"setGlobalVendorList",value:function(e){if("object"!==(void 0===e?"undefined":r(e)))throw new Error("ConsentString - You must provide an object when setting the global vendor list");if(!e.vendorListVersion||!Array.isArray(e.purposes)||!Array.isArray(e.vendors))throw new Error("ConsentString - The provided vendor list does not respect the schema from the IAB EU’s GDPR Consent and Transparency Framework");this.vendorList={vendorListVersion:e.vendorListVersion,lastUpdated:e.lastUpdated,purposes:e.purposes,features:e.features,vendors:e.vendors.slice(0).sort((function(e,t){return e.id<t.id?-1:1}))},this.vendorListVersion=e.vendorListVersion}},{key:"setCmpId",value:function(e){this.cmpId=e}},{key:"getCmpId",value:function(){return this.cmpId}},{key:"setCmpVersion",value:function(e){this.cmpVersion=e}},{key:"getCmpVersion",value:function(){return this.cmpVersion}},{key:"setConsentScreen",value:function(e){this.consentScreen=e}},{key:"getConsentScreen",value:function(){return this.consentScreen}},{key:"setConsentLanguage",value:function(e){if(!1===d.test(e))throw new Error("ConsentString - The consent language must be a two-letter ISO639-1 code (en, fr, de, etc.)");this.consentLanguage=e}},{key:"getConsentLanguage",value:function(){return this.consentLanguage}},{key:"setPurposesAllowed",value:function(e){this.allowedPurposeIds=e}},{key:"getPurposesAllowed",value:function(){return this.allowedPurposeIds}},{key:"setPurposeAllowed",value:function(e,t){var n=this.allowedPurposeIds.indexOf(e);!0===t?-1===n&&this.allowedPurposeIds.push(e):!1===t&&-1!==n&&this.allowedPurposeIds.splice(n,1)}},{key:"isPurposeAllowed",value:function(e){return-1!==this.allowedPurposeIds.indexOf(e)}},{key:"setVendorsAllowed",value:function(e){this.allowedVendorIds=e}},{key:"getVendorsAllowed",value:function(){return this.allowedVendorIds}},{key:"setVendorAllowed",value:function(e,t){var n=this.allowedVendorIds.indexOf(e);!0===t?-1===n&&this.allowedVendorIds.push(e):!1===t&&-1!==n&&this.allowedVendorIds.splice(n,1)}},{key:"isVendorAllowed",value:function(e){return-1!==this.allowedVendorIds.indexOf(e)}}],[{key:"decodeMetadataString",value:function(e){var t=l(e),n={};return f[t.version].metadataFields.forEach((function(e){n[e]=t[e]})),n}}]),e}();e.exports={ConsentString:v}},function(e,t,n){var r={"./en/":[186,"ui-ccpa-en"]};function i(e){if(!n.o(r,e))return Promise.resolve().then((function(){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}));var t=r[e],i=t[0];return n.e(t[1]).then((function(){return n(i)}))}i.keys=function(){return Object.keys(r)},i.id=108,e.exports=i},function(e,t,n){var r={"./ar/":[187,9,"ui-gdpr-ar"],"./ar/tcf/v2/":[141,3,"ui-gdpr-ar-tcf-v2"],"./az-AZ/":[188,9,"ui-gdpr-az-AZ"],"./az-AZ/tcf/v2/":[142,3,"ui-gdpr-az-AZ-tcf-v2"],"./bg/":[189,9,"ui-gdpr-bg"],"./bg/tcf/v2/":[143,3,"ui-gdpr-bg-tcf-v2"],"./bn-IN/":[190,9,"ui-gdpr-bn-IN"],"./bn-IN/tcf/v2/":[144,3,"ui-gdpr-bn-IN-tcf-v2"],"./ca/":[191,9,"ui-gdpr-ca"],"./ca/tcf/v2/":[145,3,"ui-gdpr-ca-tcf-v2"],"./cs/":[192,9,"ui-gdpr-cs"],"./cs/tcf/v2/":[146,3,"ui-gdpr-cs-tcf-v2"],"./da/":[193,9,"ui-gdpr-da"],"./da/tcf/v2/":[147,3,"ui-gdpr-da-tcf-v2"],"./de/":[194,9,"ui-gdpr-de"],"./de/tcf/v2/":[148,3,"ui-gdpr-de-tcf-v2"],"./el/":[195,9,"ui-gdpr-el"],"./el/tcf/v2/":[149,3,"ui-gdpr-el-tcf-v2"],"./en/":[196,9,"ui-gdpr-en"],"./en/tcf/v2/":[150,3,"ui-gdpr-en-tcf-v2"],"./es/":[197,9,"ui-gdpr-es"],"./es/tcf/v2/":[151,3,"ui-gdpr-es-tcf-v2"],"./et/":[198,9,"ui-gdpr-et"],"./et/tcf/v2/":[152,3,"ui-gdpr-et-tcf-v2"],"./fi/":[199,9,"ui-gdpr-fi"],"./fi/tcf/v2/":[153,3,"ui-gdpr-fi-tcf-v2"],"./fil/":[200,9,"ui-gdpr-fil"],"./fil/tcf/v2/":[154,3,"ui-gdpr-fil-tcf-v2"],"./fr/":[201,9,"ui-gdpr-fr"],"./fr/tcf/v2/":[155,3,"ui-gdpr-fr-tcf-v2"],"./he/":[202,9,"ui-gdpr-he"],"./he/tcf/v2/":[156,3,"ui-gdpr-he-tcf-v2"],"./hi-IN/":[203,9,"ui-gdpr-hi-IN"],"./hi-IN/tcf/v2/":[157,3,"ui-gdpr-hi-IN-tcf-v2"],"./hr/":[204,9,"ui-gdpr-hr"],"./hr/tcf/v2/":[158,3,"ui-gdpr-hr-tcf-v2"],"./hu/":[205,9,"ui-gdpr-hu"],"./hu/tcf/v2/":[159,3,"ui-gdpr-hu-tcf-v2"],"./id/":[206,9,"ui-gdpr-id"],"./id/tcf/v2/":[160,3,"ui-gdpr-id-tcf-v2"],"./it/":[207,9,"ui-gdpr-it"],"./it/tcf/v2/":[161,3,"ui-gdpr-it-tcf-v2"],"./ja/":[208,9,"ui-gdpr-ja"],"./ja/tcf/v2/":[162,3,"ui-gdpr-ja-tcf-v2"],"./ko/":[209,9,"ui-gdpr-ko"],"./ko/tcf/v2/":[163,3,"ui-gdpr-ko-tcf-v2"],"./lt/":[210,9,"ui-gdpr-lt"],"./lt/tcf/v2/":[164,3,"ui-gdpr-lt-tcf-v2"],"./lv/":[211,9,"ui-gdpr-lv"],"./lv/tcf/v2/":[165,3,"ui-gdpr-lv-tcf-v2"],"./mk-MK/":[212,9,"ui-gdpr-mk-MK"],"./mk-MK/tcf/v2/":[166,3,"ui-gdpr-mk-MK-tcf-v2"],"./ms/":[213,9,"ui-gdpr-ms"],"./ms/tcf/v2/":[167,3,"ui-gdpr-ms-tcf-v2"],"./nl/":[214,9,"ui-gdpr-nl"],"./nl/tcf/v2/":[168,3,"ui-gdpr-nl-tcf-v2"],"./no/":[215,9,"ui-gdpr-no"],"./no/tcf/v2/":[169,3,"ui-gdpr-no-tcf-v2"],"./pl/":[216,9,"ui-gdpr-pl"],"./pl/tcf/v2/":[170,3,"ui-gdpr-pl-tcf-v2"],"./pt-BR/":[218,9,"ui-gdpr-pt-BR"],"./pt-BR/tcf/v2/":[172,3,"ui-gdpr-pt-BR-tcf-v2"],"./pt/":[217,9,"ui-gdpr-pt"],"./pt/tcf/v2/":[171,3,"ui-gdpr-pt-tcf-v2"],"./ro/":[219,9,"ui-gdpr-ro"],"./ro/tcf/v2/":[173,3,"ui-gdpr-ro-tcf-v2"],"./ru/":[220,9,"ui-gdpr-ru"],"./ru/tcf/v2/":[174,3,"ui-gdpr-ru-tcf-v2"],"./sk/":[221,9,"ui-gdpr-sk"],"./sk/tcf/v2/":[175,3,"ui-gdpr-sk-tcf-v2"],"./sl/":[222,9,"ui-gdpr-sl"],"./sl/tcf/v2/":[176,3,"ui-gdpr-sl-tcf-v2"],"./sr/":[223,9,"ui-gdpr-sr"],"./sr/tcf/v2/":[177,3,"ui-gdpr-sr-tcf-v2"],"./sv/":[224,9,"ui-gdpr-sv"],"./sv/tcf/v2/":[178,3,"ui-gdpr-sv-tcf-v2"],"./sw/":[225,9,"ui-gdpr-sw"],"./sw/tcf/v2/":[179,3,"ui-gdpr-sw-tcf-v2"],"./th/":[226,9,"ui-gdpr-th"],"./th/tcf/v2/":[180,3,"ui-gdpr-th-tcf-v2"],"./tr/":[227,9,"ui-gdpr-tr"],"./tr/tcf/v2/":[181,3,"ui-gdpr-tr-tcf-v2"],"./uk/":[228,9,"ui-gdpr-uk"],"./uk/tcf/v2/":[182,3,"ui-gdpr-uk-tcf-v2"],"./vi/":[229,9,"ui-gdpr-vi"],"./vi/tcf/v2/":[183,3,"ui-gdpr-vi-tcf-v2"],"./zh-CN/":[230,9,"ui-gdpr-zh-CN"],"./zh-CN/tcf/v2/":[184,3,"ui-gdpr-zh-CN-tcf-v2"],"./zh-TW/":[231,9,"ui-gdpr-zh-TW"],"./zh-TW/tcf/v2/":[185,3,"ui-gdpr-zh-TW-tcf-v2"]};function i(e){if(!n.o(r,e))return Promise.resolve().then((function(){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}));var t=r[e],i=t[0];return n.e(t[2]).then((function(){return n.t(i,t[1])}))}i.keys=function(){return Object.keys(r)},i.id=109,e.exports=i},function(e,t,n){"use strict";var r,i=this&&this.__extends||(r=function(e,t){return(r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}r(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)});Object.defineProperty(t,"__esModule",{value:!0});var o=function(e){function t(t){var n=e.call(this,t)||this;return n.name="DecodingError",n}return i(t,e),t}(Error);t.DecodingError=o},function(e,t,n){"use strict";var r,i=this&&this.__extends||(r=function(e,t){return(r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}r(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)});Object.defineProperty(t,"__esModule",{value:!0});var o=function(e){function t(t){var n=e.call(this,t)||this;return n.name="EncodingError",n}return i(t,e),t}(Error);t.EncodingError=o},function(e,t,n){"use strict";var r,i=this&&this.__extends||(r=function(e,t){return(r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}r(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)});Object.defineProperty(t,"__esModule",{value:!0});var o=function(e){function t(t){var n=e.call(this,t)||this;return n.name="GVLError",n}return i(t,e),t}(Error);t.GVLError=o},function(e,t,n){"use strict";var r,i=this&&this.__extends||(r=function(e,t){return(r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}r(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)});Object.defineProperty(t,"__esModule",{value:!0});var o=function(e){function t(t,n,r){void 0===r&&(r="");var i=e.call(this,"invalid value "+n+" passed for "+t+" "+r)||this;return i.name="TCModelError",i}return i(t,e),t}(Error);t.TCModelError=o},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=function(){function e(){}return e.prototype.has=function(t){return e.langSet.has(t)},e.prototype.forEach=function(t){e.langSet.forEach(t)},Object.defineProperty(e.prototype,"size",{get:function(){return e.langSet.size},enumerable:!0,configurable:!0}),e.langSet=new Set(["BG","CA","CS","DA","DE","EL","EN","ES","ET","FI","FR","HR","HU","IT","JA","LT","LV","MT","NL","NO","PL","PT","RO","RU","SK","SL","SV","TR","ZH"]),e}();t.ConsentLanguages=r},function(e,t,n){"use strict";var r,i=this&&this.__extends||(r=function(e,t){return(r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}r(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)}),o=this&&this.__values||function(e){var t="function"==typeof Symbol&&Symbol.iterator,n=t&&e[t],r=0;if(n)return n.call(e);if(e&&"number"==typeof e.length)return{next:function(){return e&&r>=e.length&&(e=void 0),{value:e&&e[r++],done:!e}}};throw new TypeError(t?"Object is not iterable.":"Symbol.iterator is not defined.")};Object.defineProperty(t,"__esModule",{value:!0});var s=n(70),a=n(68),c=n(54),u=function(e){function t(){var t=null!==e&&e.apply(this,arguments)||this;return t.bitLength=0,t.map=new Map,t}return i(t,e),t.prototype.has=function(e){return this.map.has(e)},t.prototype.isOkToHave=function(e,t,n){var r,i=!0;if(null===(r=this.gvl)||void 0===r?void 0:r.vendors){var o=this.gvl.vendors[n];if(o)if(e===c.RestrictionType.NOT_ALLOWED)i=o.legIntPurposes.includes(t)||o.purposes.includes(t);else if(o.flexiblePurposes.length)switch(e){case c.RestrictionType.REQUIRE_CONSENT:i=o.flexiblePurposes.includes(t)&&o.legIntPurposes.includes(t);break;case c.RestrictionType.REQUIRE_LI:i=o.flexiblePurposes.includes(t)&&o.purposes.includes(t)}else i=!1;else i=!1}return i},t.prototype.add=function(e,t){if(this.isOkToHave(t.restrictionType,t.purposeId,e)){var n=t.hash;this.has(n)||(this.map.set(n,new a.BinarySearchTree),this.bitLength=0),this.map.get(n).add(e)}},t.prototype.restrictPurposeToLegalBasis=function(e){for(var t=this.gvl.vendorIds,n=e.hash,r=function(){var e,n,r;try{for(var i=o(t),s=i.next();!s.done;s=i.next())r=s.value}catch(t){e={error:t}}finally{try{s&&!s.done&&(n=i.return)&&n.call(i)}finally{if(e)throw e.error}}return r}(),i=1;i<=r;i++)this.has(n)||(this.map.set(n,new a.BinarySearchTree),this.bitLength=0),this.map.get(n).add(i)},t.prototype.getVendors=function(e){var t=[];if(e){var n=e.hash;this.has(n)&&(t=this.map.get(n).get())}else{var r=new Set;this.map.forEach((function(e){e.get().forEach((function(e){r.add(e)}))})),t=Array.from(r)}return t},t.prototype.getRestrictionType=function(e,t){var n;return this.getRestrictions(e).forEach((function(e){e.purposeId===t&&(void 0===n||n>e.restrictionType)&&(n=e.restrictionType)})),n},t.prototype.vendorHasRestriction=function(e,t){for(var n=!1,r=this.getRestrictions(e),i=0;i<r.length&&!n;i++)n=t.isSameAs(r[i]);return n},t.prototype.getMaxVendorId=function(){var e=0;return this.map.forEach((function(t){e=Math.max(t.max(),e)})),e},t.prototype.getRestrictions=function(e){var t=[];return this.map.forEach((function(n,r){e?n.contains(e)&&t.push(s.PurposeRestriction.unHash(r)):t.push(s.PurposeRestriction.unHash(r))})),t},t.prototype.getPurposes=function(){var e=new Set;return this.map.forEach((function(t,n){e.add(s.PurposeRestriction.unHash(n).purposeId)})),Array.from(e)},t.prototype.remove=function(e,t){var n=t.hash,r=this.map.get(n);r&&(r.remove(e),r.isEmpty()&&(this.map.delete(n),this.bitLength=0))},Object.defineProperty(t.prototype,"gvl",{get:function(){return this.gvl_},set:function(e){var t=this;this.gvl_||(this.gvl_=e,this.map.forEach((function(e,n){var r=s.PurposeRestriction.unHash(n);e.get().forEach((function(n){t.isOkToHave(r.restrictionType,r.purposeId,n)||e.remove(n)}))})))},enumerable:!0,configurable:!0}),t.prototype.isEmpty=function(){return 0===this.map.size},Object.defineProperty(t.prototype,"numRestrictions",{get:function(){return this.map.size},enumerable:!0,configurable:!0}),t}(n(34).Cloneable);t.PurposeRestrictionVector=u},function(e,t,n){"use strict";var r;Object.defineProperty(t,"__esModule",{value:!0}),(r=t.DeviceDisclosureStorageAccessType||(t.DeviceDisclosureStorageAccessType={})).COOKIE="cookie",r.WEB="web",r.APP="app"},function(e,t,n){"use strict";var r;Object.defineProperty(t,"__esModule",{value:!0});var i=n(71),o=function(){function e(){}return e.ID_TO_KEY=[i.Segment.CORE,i.Segment.VENDORS_DISCLOSED,i.Segment.VENDORS_ALLOWED,i.Segment.PUBLISHER_TC],e.KEY_TO_ID=((r={})[i.Segment.CORE]=0,r[i.Segment.VENDORS_DISCLOSED]=1,r[i.Segment.VENDORS_ALLOWED]=2,r[i.Segment.PUBLISHER_TC]=3,r),e}();t.SegmentIDs=o},function(e,t,n){"use strict";var r,i=this&&this.__extends||(r=function(e,t){return(r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}r(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)}),o=this&&this.__generator||function(e,t){var n,r,i,o,s={label:0,sent:function(){if(1&i[0])throw i[1];return i[1]},trys:[],ops:[]};return o={next:a(0),throw:a(1),return:a(2)},"function"==typeof Symbol&&(o[Symbol.iterator]=function(){return this}),o;function a(o){return function(a){return function(o){if(n)throw new TypeError("Generator is already executing.");for(;s;)try{if(n=1,r&&(i=2&o[0]?r.return:o[0]?r.throw||((i=r.return)&&i.call(r),0):r.next)&&!(i=i.call(r,o[1])).done)return i;switch(r=0,i&&(o=[2&o[0],i.value]),o[0]){case 0:case 1:i=o;break;case 4:return s.label++,{value:o[1],done:!1};case 5:s.label++,r=o[1],o=[0];continue;case 7:o=s.ops.pop(),s.trys.pop();continue;default:if(!((i=(i=s.trys).length>0&&i[i.length-1])||6!==o[0]&&2!==o[0])){s=0;continue}if(3===o[0]&&(!i||o[1]>i[0]&&o[1]<i[3])){s.label=o[1];break}if(6===o[0]&&s.label<i[1]){s.label=i[1],i=o;break}if(i&&s.label<i[2]){s.label=i[2],s.ops.push(o);break}i[2]&&s.ops.pop(),s.trys.pop();continue}o=t.call(e,s)}catch(e){o=[6,e],r=0}finally{n=i=0}if(5&o[0])throw o[1];return{value:o[0]?o[1]:void 0,done:!0}}([o,a])}}};Object.defineProperty(t,"__esModule",{value:!0});var s=n(34),a=n(22),c=function(e){function t(){var t=null!==e&&e.apply(this,arguments)||this;return t.bitLength=0,t.maxId_=0,t.set_=new Set,t}return i(t,e),t.prototype[Symbol.iterator]=function(){var e;return o(this,(function(t){switch(t.label){case 0:e=1,t.label=1;case 1:return e<=this.maxId?[4,[e,this.has(e)]]:[3,4];case 2:t.sent(),t.label=3;case 3:return e++,[3,1];case 4:return[2]}}))},t.prototype.values=function(){return this.set_.values()},Object.defineProperty(t.prototype,"maxId",{get:function(){return this.maxId_},enumerable:!0,configurable:!0}),t.prototype.has=function(e){return this.set_.has(e)},t.prototype.unset=function(e){var t=this;Array.isArray(e)?e.forEach((function(e){return t.unset(e)})):"object"==typeof e?this.unset(Object.keys(e).map((function(e){return+e}))):(this.set_.delete(e),this.bitLength=0,e===this.maxId&&(this.maxId_=0,this.set_.forEach((function(e){t.maxId_=Math.max(t.maxId,e)}))))},t.prototype.isIntMap=function(e){var t=this,n="object"==typeof e;return n&&Object.keys(e).every((function(n){var r=Number.isInteger(parseInt(n,10));return(r=r&&t.isValidNumber(e[n].id))&&void 0!==e[n].name}))},t.prototype.isValidNumber=function(e){return parseInt(e,10)>0},t.prototype.isSet=function(e){var t=!1;return e instanceof Set&&(t=Array.from(e).every(this.isValidNumber)),t},t.prototype.set=function(e){var t=this;if(Array.isArray(e))e.forEach((function(e){return t.set(e)}));else if(this.isSet(e))this.set(Array.from(e));else if(this.isIntMap(e))this.set(Object.keys(e).map((function(e){return+e})));else{if(!this.isValidNumber(e))throw new a.TCModelError("set()",e,"must be positive integer array, positive integer, Set<number>, or IntMap");this.set_.add(e),this.maxId_=Math.max(this.maxId,e),this.bitLength=0}},t.prototype.empty=function(){this.set_=new Set},t.prototype.forEach=function(e){for(var t=1;t<=this.maxId;t++)e(this.has(t),t)},Object.defineProperty(t.prototype,"size",{get:function(){return this.set_.size},enumerable:!0,configurable:!0}),t.prototype.setAll=function(e){this.set(e)},t}(s.Cloneable);t.Vector=c},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(67),i=n(53),o=n(72),s=n(78),a=n(22),c=n(69),u=n(23),p=function(){function e(){}return e.encode=function(e,t){var n,s=this;try{n=this.fieldSequence[""+e.version][t]}catch(n){throw new a.EncodingError("Unable to encode version: "+e.version+", segment: "+t)}var p="";return t!==u.Segment.CORE&&(p=o.IntEncoder.encode(u.SegmentIDs.KEY_TO_ID[t],i.BitLength.segmentType)),n.forEach((function(n){var r=e[n],u=o.FieldEncoderMap[n],l=i.BitLength[n];void 0===l&&s.isPublisherCustom(n)&&(l=+e[c.Fields.numCustomPurposes]);try{p+=u.encode(r,l)}catch(e){throw new a.EncodingError("Error encoding "+t+"->"+n+": "+e.message)}})),r.Base64Url.encode(p)},e.decode=function(e,t,n){var s=this,p=r.Base64Url.decode(e),l=0;return n===u.Segment.CORE&&(t.version=o.IntEncoder.decode(p.substr(l,i.BitLength[c.Fields.version]),i.BitLength[c.Fields.version])),n!==u.Segment.CORE&&(l+=i.BitLength.segmentType),this.fieldSequence[""+t.version][n].forEach((function(e){var n=o.FieldEncoderMap[e],r=i.BitLength[e];if(void 0===r&&s.isPublisherCustom(e)&&(r=+t[c.Fields.numCustomPurposes]),0!==r){var u=p.substr(l,r);if(n===o.VendorVectorEncoder?t[e]=n.decode(u,t.version):t[e]=n.decode(u,r),Number.isInteger(r))l+=r;else{if(!Number.isInteger(t[e].bitLength))throw new a.DecodingError(e);l+=t[e].bitLength}}})),t},e.isPublisherCustom=function(e){return 0===e.indexOf("publisherCustom")},e.fieldSequence=new s.FieldSequence,e}();t.SegmentEncoder=p},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(23),i=n(39),o=n(73),s=n(55),a=n(35),c=n(74),u=n(75),p=n(76),l=function(){function e(){}var t,n,l,f,d,v,h,g,b,y,m,S,O,C,w,P,k,j,_,I,A,T,E,L,D,x;return t=r.Fields.version,n=r.Fields.created,l=r.Fields.lastUpdated,f=r.Fields.cmpId,d=r.Fields.cmpVersion,v=r.Fields.consentScreen,h=r.Fields.consentLanguage,g=r.Fields.vendorListVersion,b=r.Fields.policyVersion,y=r.Fields.isServiceSpecific,m=r.Fields.useNonStandardStacks,S=r.Fields.specialFeatureOptins,O=r.Fields.purposeConsents,C=r.Fields.purposeLegitimateInterests,w=r.Fields.purposeOneTreatment,P=r.Fields.publisherCountryCode,k=r.Fields.vendorConsents,j=r.Fields.vendorLegitimateInterests,_=r.Fields.publisherRestrictions,I=r.Fields.vendorsDisclosed,A=r.Fields.vendorsAllowed,T=r.Fields.publisherConsents,E=r.Fields.publisherLegitimateInterests,L=r.Fields.numCustomPurposes,D=r.Fields.publisherCustomConsents,x=r.Fields.publisherCustomLegitimateInterests,e[t]=a.IntEncoder,e[n]=o.DateEncoder,e[l]=o.DateEncoder,e[f]=a.IntEncoder,e[d]=a.IntEncoder,e[v]=a.IntEncoder,e[h]=c.LangEncoder,e[g]=a.IntEncoder,e[b]=a.IntEncoder,e[y]=i.BooleanEncoder,e[m]=i.BooleanEncoder,e[S]=s.FixedVectorEncoder,e[O]=s.FixedVectorEncoder,e[C]=s.FixedVectorEncoder,e[w]=i.BooleanEncoder,e[P]=c.LangEncoder,e[k]=p.VendorVectorEncoder,e[j]=p.VendorVectorEncoder,e[_]=u.PurposeRestrictionVectorEncoder,e.segmentType=a.IntEncoder,e[I]=p.VendorVectorEncoder,e[A]=p.VendorVectorEncoder,e[T]=s.FixedVectorEncoder,e[E]=s.FixedVectorEncoder,e[L]=a.IntEncoder,e[D]=s.FixedVectorEncoder,e[x]=s.FixedVectorEncoder,e}();t.FieldEncoderMap=l},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(23);t.FieldSequence=function(){var e,t;this[1]=((e={})[r.Segment.CORE]=[r.Fields.version,r.Fields.created,r.Fields.lastUpdated,r.Fields.cmpId,r.Fields.cmpVersion,r.Fields.consentScreen,r.Fields.consentLanguage,r.Fields.vendorListVersion,r.Fields.purposeConsents,r.Fields.vendorConsents],e),this[2]=((t={})[r.Segment.CORE]=[r.Fields.version,r.Fields.created,r.Fields.lastUpdated,r.Fields.cmpId,r.Fields.cmpVersion,r.Fields.consentScreen,r.Fields.consentLanguage,r.Fields.vendorListVersion,r.Fields.policyVersion,r.Fields.isServiceSpecific,r.Fields.useNonStandardStacks,r.Fields.specialFeatureOptins,r.Fields.purposeConsents,r.Fields.purposeLegitimateInterests,r.Fields.purposeOneTreatment,r.Fields.publisherCountryCode,r.Fields.vendorConsents,r.Fields.vendorLegitimateInterests,r.Fields.publisherRestrictions],t[r.Segment.PUBLISHER_TC]=[r.Fields.publisherConsents,r.Fields.publisherLegitimateInterests,r.Fields.numCustomPurposes,r.Fields.publisherCustomConsents,r.Fields.publisherCustomLegitimateInterests],t[r.Segment.VENDORS_ALLOWED]=[r.Fields.vendorsAllowed],t[r.Segment.VENDORS_DISCLOSED]=[r.Fields.vendorsDisclosed],t)}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(23);t.SegmentSequence=function(e,t){if(this[1]=[r.Segment.CORE],this[2]=[r.Segment.CORE],2===e.version)if(e.isServiceSpecific)this[2].push(r.Segment.PUBLISHER_TC);else{var n=!(!t||!t.isForVendors);n&&!0!==e[r.Fields.supportOOB]||this[2].push(r.Segment.VENDORS_DISCLOSED),n&&(e[r.Fields.supportOOB]&&e[r.Fields.vendorsAllowed].size>0&&this[2].push(r.Segment.VENDORS_ALLOWED),this[2].push(r.Segment.PUBLISHER_TC))}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(22),i=n(23),o=function(){function e(){}return e.process=function(e,t){var n,i,o=e.gvl;if(!o)throw new r.EncodingError("Unable to encode TCModel without a GVL");if(!o.isReady)throw new r.EncodingError("Unable to encode TCModel tcModel.gvl.readyPromise is not resolved");(e=e.clone()).consentLanguage=o.language.toUpperCase(),(null===(n=t)||void 0===n?void 0:n.version)>0&&(null===(i=t)||void 0===i?void 0:i.version)<=this.processor.length?e.version=t.version:e.version=this.processor.length;var s=e.version-1;if(!this.processor[s])throw new r.EncodingError("Invalid version: "+e.version);return this.processor[s](e,o)},e.processor=[function(e){return e},function(e,t){e.publisherRestrictions.gvl=t,e.purposeLegitimateInterests.unset(1);var n=new Map;return n.set("legIntPurposes",e.vendorLegitimateInterests),n.set("purposes",e.vendorConsents),n.forEach((function(n,r){n.forEach((function(o,s){if(o){var a=t.vendors[s];if(!a||a.deletedDate)n.unset(s);else if(0===a[r].length)if(e.isServiceSpecific)if(0===a.flexiblePurposes.length)n.unset(s);else{for(var c=e.publisherRestrictions.getRestrictions(s),u=!1,p=0,l=c.length;p<l&&!u;p++)u=c[p].restrictionType===i.RestrictionType.REQUIRE_CONSENT&&"purposes"===r||c[p].restrictionType===i.RestrictionType.REQUIRE_LI&&"legIntPurposes"===r;u||n.unset(s)}else n.unset(s)}}))})),e.vendorsDisclosed.set(t.vendors),e}],e}();t.SemanticPreEncoder=o},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(52),i=n(23),o=n(35),s=n(81),a=function(){function e(){}return e.encode=function(e,t){var n,i,o="";return e=r.SemanticPreEncoder.process(e,t),(i=Array.isArray(null===(n=t)||void 0===n?void 0:n.segments)?t.segments:new r.SegmentSequence(e,t)[""+e.version]).forEach((function(t,n){var s="";n<i.length-1&&(s="."),o+=r.SegmentEncoder.encode(e,t)+s})),o},e.decode=function(e,t){var n=e.split("."),a=n.length;t||(t=new s.TCModel);for(var c=0;c<a;c++){var u=n[c],p=r.Base64Url.decode(u.charAt(0)).substr(0,r.BitLength.segmentType),l=i.SegmentIDs.ID_TO_KEY[o.IntEncoder.decode(p,r.BitLength.segmentType).toString()];r.SegmentEncoder.decode(u,t,l)}return t},e}();t.TCString=a},function(e,t,n){"use strict";var r;Object.defineProperty(t,"__esModule",{value:!0}),(r=t.CmpStatus||(t.CmpStatus={})).STUB="stub",r.LOADING="loading",r.LOADED="loaded",r.ERROR="error"},function(e,t,n){"use strict";var r;Object.defineProperty(t,"__esModule",{value:!0}),(r=t.DisplayStatus||(t.DisplayStatus={})).VISIBLE="visible",r.HIDDEN="hidden",r.DISABLED="disabled"},function(e,t,n){"use strict";var r;Object.defineProperty(t,"__esModule",{value:!0}),(r=t.EventStatus||(t.EventStatus={})).TC_LOADED="tcloaded",r.CMP_UI_SHOWN="cmpuishown",r.USER_ACTION_COMPLETE="useractioncomplete"},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(45),i=function(){function e(){this.eventQueue=new Map,this.queueNumber=0}return e.prototype.add=function(e){return this.eventQueue.set(this.queueNumber,e),this.queueNumber++},e.prototype.remove=function(e){return this.eventQueue.delete(e)},e.prototype.exec=function(){this.eventQueue.forEach((function(e,t){new r.GetTCDataCommand(e.callback,e.param,t,e.next)}))},e.prototype.clear=function(){this.queueNumber=0,this.eventQueue.clear()},Object.defineProperty(e.prototype,"size",{get:function(){return this.eventQueue.size},enumerable:!0,configurable:!0}),e}();t.EventListenerQueue=i},function(e,t,n){"use strict";var r,i=this&&this.__extends||(r=function(e,t){return(r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}r(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)}),o=this&&this.__read||function(e,t){var n="function"==typeof Symbol&&e[Symbol.iterator];if(!n)return e;var r,i,o=n.call(e),s=[];try{for(;(void 0===t||t-- >0)&&!(r=o.next()).done;)s.push(r.value)}catch(e){i={error:e}}finally{try{r&&!r.done&&(n=o.return)&&n.call(o)}finally{if(i)throw i.error}}return s},s=this&&this.__spread||function(){for(var e=[],t=0;t<arguments.length;t++)e=e.concat(o(arguments[t]));return e};Object.defineProperty(t,"__esModule",{value:!0});var a=function(e){function t(t){var n=e.call(this,t)||this;return delete n.outOfBand,n}return i(t,e),t.prototype.createVectorField=function(e){return s(e).reduce((function(e,t){return e+(t[1]?"1":"0")}),"")},t.prototype.createRestrictions=function(e){var t={};if(e.numRestrictions>0){var n=e.getMaxVendorId();e.getRestrictions().forEach((function(e){t[e.purposeId.toString()]="_".repeat(n)}));for(var r=function(n){var r=n+1;e.getRestrictions(r).forEach((function(e){var r=e.restrictionType.toString(),i=e.purposeId.toString(),o=t[i].substr(0,n),s=t[i].substr(n+1);t[i]=o+r+s}))},i=0;i<n;i++)r(i)}return t},t}(n(85).TCData);t.InAppTCData=a},function(e,t,n){"use strict";var r,i=this&&this.__extends||(r=function(e,t){return(r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}r(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)});Object.defineProperty(t,"__esModule",{value:!0});var o=n(32),s=function(e){function t(){var t=e.call(this)||this;return t.cmpLoaded=!0,t.cmpStatus=o.CmpApiModel.cmpStatus,t.displayStatus=o.CmpApiModel.displayStatus,t.apiVersion=""+o.CmpApiModel.apiVersion,o.CmpApiModel.tcModel&&o.CmpApiModel.tcModel.vendorListVersion&&(t.gvlVersion=+o.CmpApiModel.tcModel.vendorListVersion),t}return i(t,e),t}(n(43).Response);t.Ping=s},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(32),i=n(44),o=n(86),s=n(16),a=function(){function e(e,t,n,i){void 0===n&&(n=!1),this.numUpdates=0,this.throwIfInvalidInt(e,"cmpId",2),this.throwIfInvalidInt(t,"cmpVersion",0),r.CmpApiModel.cmpId=e,r.CmpApiModel.cmpVersion=t,this.isServiceSpecific=!!n,this.callResponder=new o.CallResponder(i)}return e.prototype.throwIfInvalidInt=function(e,t,n){if(!("number"==typeof e&&Number.isInteger(e)&&e>=n))throw new Error("Invalid "+t+": "+e)},e.prototype.update=function(e,t){if(void 0===t&&(t=!1),r.CmpApiModel.disabled)throw new Error("CmpApi Disabled");r.CmpApiModel.cmpStatus=i.CmpStatus.LOADED,t?(r.CmpApiModel.displayStatus=i.DisplayStatus.VISIBLE,r.CmpApiModel.eventStatus=i.EventStatus.CMP_UI_SHOWN):void 0===r.CmpApiModel.tcModel?(r.CmpApiModel.displayStatus=i.DisplayStatus.DISABLED,r.CmpApiModel.eventStatus=i.EventStatus.TC_LOADED):(r.CmpApiModel.displayStatus=i.DisplayStatus.HIDDEN,r.CmpApiModel.eventStatus=i.EventStatus.USER_ACTION_COMPLETE),r.CmpApiModel.gdprApplies=null!==e,r.CmpApiModel.gdprApplies?(""===e?(r.CmpApiModel.tcModel=new s.TCModel,r.CmpApiModel.tcModel.cmpId=r.CmpApiModel.cmpId,r.CmpApiModel.tcModel.cmpVersion=r.CmpApiModel.cmpVersion):r.CmpApiModel.tcModel=s.TCString.decode(e),r.CmpApiModel.tcModel.isServiceSpecific=this.isServiceSpecific,r.CmpApiModel.tcfPolicyVersion=+r.CmpApiModel.tcModel.policyVersion,r.CmpApiModel.tcString=e):r.CmpApiModel.tcModel=null,0===this.numUpdates?this.callResponder.purgeQueuedCalls():r.CmpApiModel.eventQueue.exec(),this.numUpdates++},e.prototype.disable=function(){r.CmpApiModel.disabled=!0,r.CmpApiModel.cmpStatus=i.CmpStatus.ERROR},e}();t.CmpApi=a},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(133),i=n(45),o=n(134),s=n(135),a=n(136),c=n(137),u=n(83),p=function(){function e(){}var t,n,p,l,f,d;return t=u.TCFCommand.PING,n=u.TCFCommand.GET_TC_DATA,p=u.TCFCommand.GET_IN_APP_TC_DATA,l=u.TCFCommand.GET_VENDOR_LIST,f=u.TCFCommand.ADD_EVENT_LISTENER,d=u.TCFCommand.REMOVE_EVENT_LISTENER,e[t]=r.PingCommand,e[n]=i.GetTCDataCommand,e[p]=o.GetInAppTCDataCommand,e[l]=s.GetVendorListCommand,e[f]=a.AddEventListenerCommand,e[d]=c.RemoveEventListenerCommand,e}();t.CommandMap=p},function(e,t,n){"use strict";var r,i=this&&this.__extends||(r=function(e,t){return(r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}r(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)});Object.defineProperty(t,"__esModule",{value:!0});var o=n(42),s=function(e){function t(){return null!==e&&e.apply(this,arguments)||this}return i(t,e),t.prototype.respond=function(){this.invokeCallback(new o.Ping)},t}(n(46).Command);t.PingCommand=s},function(e,t,n){"use strict";var r,i=this&&this.__extends||(r=function(e,t){return(r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}r(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)});Object.defineProperty(t,"__esModule",{value:!0});var o=n(45),s=n(42),a=function(e){function t(){return null!==e&&e.apply(this,arguments)||this}return i(t,e),t.prototype.respond=function(){this.throwIfParamInvalid(),this.invokeCallback(new s.InAppTCData(this.param))},t}(o.GetTCDataCommand);t.GetInAppTCDataCommand=a},function(e,t,n){"use strict";var r,i=this&&this.__extends||(r=function(e,t){return(r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}r(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)});Object.defineProperty(t,"__esModule",{value:!0});var o=n(32),s=n(46),a=n(16),c=function(e){function t(){return null!==e&&e.apply(this,arguments)||this}return i(t,e),t.prototype.respond=function(){var e,t=this,n=o.CmpApiModel.tcModel,r=n.vendorListVersion;void 0===this.param&&(this.param=r),(e=this.param===r&&n.gvl?n.gvl:new a.GVL(this.param)).readyPromise.then((function(){t.invokeCallback(e.getJson())}))},t}(s.Command);t.GetVendorListCommand=c},function(e,t,n){"use strict";var r,i=this&&this.__extends||(r=function(e,t){return(r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}r(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)});Object.defineProperty(t,"__esModule",{value:!0});var o=n(32),s=function(e){function t(){return null!==e&&e.apply(this,arguments)||this}return i(t,e),t.prototype.respond=function(){this.listenerId=o.CmpApiModel.eventQueue.add({callback:this.callback,param:this.param,next:this.next}),e.prototype.respond.call(this)},t}(n(45).GetTCDataCommand);t.AddEventListenerCommand=s},function(e,t,n){"use strict";var r,i=this&&this.__extends||(r=function(e,t){return(r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}r(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)});Object.defineProperty(t,"__esModule",{value:!0});var o=n(32),s=function(e){function t(){return null!==e&&e.apply(this,arguments)||this}return i(t,e),t.prototype.respond=function(){this.invokeCallback(o.CmpApiModel.eventQueue.remove(this.param))},t}(n(46).Command);t.RemoveEventListenerCommand=s},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=function(){function e(){}return e.has=function(e){return"string"==typeof e&&(e=+e),this.set_.has(e)},e.set_=new Set([0,2,void 0,null]),e}();t.SupportedVersions=r},function(e,t,n){"use strict";n.r(t);var r=n(5),i=n.n(r),o=n(18),s=n.n(o),a=(n(93),n(24)),c=n(0),u=n(3),p=n.n(u),l=n(4),f=n.n(l),d=n(6),v=n.n(d),h=n(7),g=n.n(h),b=n(2),y=n.n(b),m=n(12);function S(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=y()(e);if(t){var i=y()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return g()(this,n)}}var O=function(e){v()(n,e);var t=S(n);function n(){return p()(this,n),t.apply(this,arguments)}return f()(n,[{key:"configure",value:function(e){var t=e.apiPath,n={};"string"==typeof t&&t?Object(c.l)(n,"apiPath",t):console.error('Didomi - Invalid API path "'.concat(t,'". Ensure that the API path is a non-empty string.')),this.actions.setSDKConfig(n)}},{key:"get",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,t=Object(c.f)(this.store.getState(),"sdkConfig",{});return null===e?t:t[e]?t[e]:null}}]),n}(m.a);function C(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=y()(e);if(t){var i=y()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return g()(this,n)}}var w=function(e){v()(n,e);var t=C(n);function n(){return p()(this,n),t.apply(this,arguments)}return f()(n,[{key:"configure",value:function(e){e&&this.actions.setTheme(e)}},{key:"getCss",value:function(){return Object(c.f)(this.store.getState(),"theme.css",null)}}]),n}(m.a),P=n(1),k=n.n(P),j=n(90),_=n(48),I=n(27),A=n(49),T=n.n(A);function E(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function L(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?E(Object(n),!0).forEach((function(t){i()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):E(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function D(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function x(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?D(Object(n),!0).forEach((function(t){i()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):D(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function R(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=y()(e);if(t){var i=y()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return g()(this,n)}}var V=function(e){v()(n,e);var t=R(n);function n(e,r){return p()(this,n),t.call(this,x(x({},e),{},{currentValue:r,hasCurrentValue:!0}))}return f()(n,[{key:"clone",value:function(e){var t=new n(e,this.parameters.currentValue);return this.subscribe(t.next.bind(t)),t}},{key:"getValue",value:function(){return this.parameters.currentValue}},{key:"subscribe",value:function(e){for(var t=T()(y()(n.prototype),"subscribe",this).call(this,e),r=0,i=this.parameters.filters;r<i.length;r++){if(!0!==(0,i[r])(this.parameters.currentValue))return}t(this.parameters.currentValue)}}]),n}(function(){function e(t){p()(this,e),this.parameters={filters:Object(c.f)(t,"filters",[]),first:Object(c.f)(t,"first",!1),distinctUntilChanged:Object(c.f)(t,"distinctUntilChanged",!1),currentValue:Object(c.f)(t,"currentValue"),hasCurrentValue:Object(c.f)(t,"hasCurrentValue",!1)},this.subscribers=[]}return f()(e,[{key:"clone",value:function(t){var n=new e(t);return this.subscribe(n.next.bind(n)),n}},{key:"distinctUntilChanged",value:function(){return this.clone(L(L({},this.parameters),{},{distinctUntilChanged:!0}))}},{key:"filter",value:function(e){if("function"!=typeof e)throw new Error("You must pass a Function to filter an observable");return this.clone(L(L({},this.parameters),{},{filters:[].concat(k()(this.parameters.filters),[e])}))}},{key:"first",value:function(){return this.clone(L(L({},this.parameters),{},{first:!0}))}},{key:"subscribe",value:function(e){if("function"!=typeof e)throw new Error("You must pass a Function to subscribe to an observable");var t=this,n=function n(r){e(r),!0===t.parameters.first&&n.unsubscribe()};return n.unsubscribe=function(){var e=t.subscribers.indexOf(n);-1!==e&&t.subscribers.splice(e,1)},this.subscribers.push(n),n}},{key:"next",value:function(e){for(var t=0,n=this.parameters.filters;t<n.length;t++){if(!0!==(0,n[t])(e))return}if(!0!==this.parameters.distinctUntilChanged||!0!==this.parameters.hasCurrentValue||e!==this.parameters.currentValue){for(var r=0,i=this.subscribers;r<i.length;r++){(0,i[r])(e)}this.parameters.currentValue=e,this.parameters.hasCurrentValue=!0}}}]),e}()),B=n(50),F=n.n(B);function U(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=y()(e);if(t){var i=y()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return g()(this,n)}}var M=function(e){v()(n,e);var t=U(n);function n(e,r,i){var o;return p()(this,n),(o=t.call(this,e,r,i)).emitter=Object(_.EventEmitter)(F()(o)),o}return f()(n)}(m.a),N=n(8),z=n(10),G=n(25),q=n(9),W=n(29),K=Object(z.a)((function(e){return e.user.ignoreConsentBefore}),G.a,(function(e,t){return!!(e&&e<new Date&&t<e)})),H=function(e,t){return function(e,t){return Object(z.a)(q.b,(function(e){return Object(W.c)(t,e)}))(e)}(e,t)||function(e,t){return Object(z.a)(q.d,(function(e){return Object(W.c)(t,e)&&Object(W.a)(t)}))(e)}(e,t)},J=function(e){return e.user.organizationUserId},Q=function(e){var t=e.user;return{organizationUserId:t.organizationUserId,organizationUserIdAuthAlgorithm:t.organizationUserIdAuthAlgorithm,organizationUserIdAuthSid:t.organizationUserIdAuthSid,organizationUserIdAuthSalt:t.organizationUserIdAuthSalt,organizationUserIdAuthDigest:t.organizationUserIdAuthDigest,organizationUserIdExp:t.organizationUserIdExp,organizationUserIdIv:t.organizationUserIdIv}},Y=n(17);function Z(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function X(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?Z(Object(n),!0).forEach((function(t){i()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):Z(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function $(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=y()(e);if(t){var i=y()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return g()(this,n)}}var ee=function(e){v()(n,e);var t=$(n);function n(){return p()(this,n),t.apply(this,arguments)}return f()(n,[{key:"getUserConsentTokenDeprecated",value:function(){return Object(j.CWTFromCompressedJSON)(JSON.stringify(this.services.StorageService.getTokenFromLocalStore()))}},{key:"getUserConsentStatusForAll",value:function(){var e=this.services.StorageService.getTokenFromLocalStore(),t=e.purposes.enabled||[],n=e.purposes.disabled||[],r=this.services.WebsiteService.getEssentialPurposes(),i=e.vendors.enabled||[],o=e.vendors.disabled||[];return{purposes:{enabled:[].concat(k()(t),k()(r)),disabled:k()(n)},vendors:{enabled:k()(i),disabled:k()(o)}}}},{key:"getUserConsentStatus",value:function(e,t){var n,r,i,o;t=parseInt(t,10)||t;var s=this.services.StorageService.getTokenFromLocalStore(),a=(null===(n=s.purposes)||void 0===n?void 0:n.enabled)||[],c=(null===(r=s.purposes)||void 0===r?void 0:r.disabled)||[],u=this.services.WebsiteService.getEssentialPurposes(),p=(null===(i=s.vendors)||void 0===i?void 0:i.enabled)||[],l=(null===(o=s.vendors)||void 0===o?void 0:o.disabled)||[];return-1!==u.indexOf(e)&&-1!==p.indexOf(t)||(-1!==a.indexOf(e)&&-1!==p.indexOf(t)||(-1===u.indexOf(e)&&-1===a.indexOf(e)&&-1===c.indexOf(e)||-1===p.indexOf(t)&&-1===l.indexOf(t))&&void 0)}},{key:"hasAllConsentStatus",value:function(e,t,n){for(var r=[],i=0;i<e.length;i++){var o=e[i];"consent"===o.legalBasis?r.push(this.getUserConsentStatusByPurpose(o.id)):"legitimate_interest"===o.legalBasis&&r.push(this.getLegitimateInterestStatusForPurpose(o.id))}for(var s=0;s<t.length;s++){var a=t[s];Array.isArray(a.purposeIds)&&a.purposeIds.length>0&&r.push(this.getUserConsentStatusByVendor(a.id)),n&&Array.isArray(a.legIntPurposeIds)&&a.legIntPurposeIds.length>0&&r.push(this.getLegitimateInterestStatusForVendor(a.id))}return!1===r.some((function(e){return void 0===e}))}},{key:"hasAnyConsentStatus",value:function(){var e,t,n,r,i=this.services.StorageService.getTokenFromLocalStore(),o=(null===(e=i.purposes)||void 0===e?void 0:e.enabled)||[],s=(null===(t=i.purposes)||void 0===t?void 0:t.disabled)||[],a=(null===(n=i.vendors)||void 0===n?void 0:n.enabled)||[],c=(null===(r=i.vendors)||void 0===r?void 0:r.disabled)||[];return o.length>0||s.length>0||a.length>0||c.length>0}},{key:"hasAnyLegitimateInterestStatus",value:function(){var e,t,n,r,i=this.services.StorageService.getTokenFromLocalStore(),o=(null===(e=i.purposes_li)||void 0===e?void 0:e.enabled)||[],s=(null===(t=i.purposes_li)||void 0===t?void 0:t.disabled)||[],a=(null===(n=i.vendors_li)||void 0===n?void 0:n.enabled)||[],c=(null===(r=i.vendors_li)||void 0===r?void 0:r.disabled)||[];return o.length>0||s.length>0||a.length>0||c.length>0}},{key:"hasAnyStatus",value:function(){return this.hasAnyConsentStatus()||this.hasAnyLegitimateInterestStatus()}},{key:"getUserConsentStatusForAllPurposesByVendor",value:function(e){e=parseInt(e,10)||e;var t=Object(c.f)(this.store.getState(),"consentByVendor.".concat(e,".consentToAllPurposes"));if("boolean"==typeof t)return t}},{key:"getObservableOnUserConsentStatusForAllPurposesByVendor",value:function(e){var t=this,n=new V(null,this.getUserConsentStatusForAllPurposesByVendor(e)),r=this.emitter.listenerCount();return r>=_.EventEmitter.defaultMaxListeners&&this.emitter.setMaxListeners(r+1),this.on("internal.consent.changed",(function(){n.next(t.getUserConsentStatusForAllPurposesByVendor(e))})),n.distinctUntilChanged()}},{key:"getLegitimateInterestStatusForVendor",value:function(e){var t,n;if(2!==this.services.TCFService.getVersion())return!0;e=parseInt(e,10)||e;var r=this.services.StorageService.getTokenFromLocalStore(),i=(null===(t=r.vendors_li)||void 0===t?void 0:t.enabled)||[],o=(null===(n=r.vendors_li)||void 0===n?void 0:n.disabled)||[];return-1!==i.indexOf(e)||-1===o.indexOf(e)&&void 0}},{key:"getUserStatusForVendor",value:function(e){var t=this.services.DatabasesService.getVendor(e);if(t){var n=!0,r=!0;return Array.isArray(t.legIntPurposeIds)&&t.legIntPurposeIds.length>0&&(n=this.getLegitimateInterestStatusForVendor(t.id)),Array.isArray(t.purposeIds)&&t.purposeIds.length>0&&(r=this.getUserConsentStatusByVendor(t.id)),n&&r}}},{key:"getUserStatusForVendorAndLinkedPurposes",value:function(e){var t=this,n=this.services.DatabasesService.getVendor(e),r=this.services.HooksService.get("isVendorEnabled");if(r){var i,o,s,a,c=this.services.StorageService.getTokenFromLocalStore();return r({vendor:n,enabledPurposes:null===(i=c.purposes)||void 0===i?void 0:i.enabled,disabledPurposes:null===(o=c.purposes)||void 0===o?void 0:o.disabled,enabledVendors:null===(s=c.vendors)||void 0===s?void 0:s.enabled,disabledVendors:null===(a=c.vendors)||void 0===a?void 0:a.disabled})}if(n){var u=!0,p=!0;return Array.isArray(n.legIntPurposeIds)&&n.legIntPurposeIds.length>0&&(u=n.legIntPurposeIds.reduce((function(e,n){return!1===e?e:t.getLegitimateInterestStatusForPurpose(n)}),!0)),Array.isArray(n.purposeIds)&&n.purposeIds.length>0&&(p=n.purposeIds.reduce((function(e,n){return!1===e?e:t.getUserConsentStatusByPurpose(n)}),!0)),this.getUserStatusForVendor(e)&&u&&p}}},{key:"getUserConsentStatusByVendor",value:function(e){var t,n;e=parseInt(e,10)||e;var r=this.services.StorageService.getTokenFromLocalStore(),i=(null===(t=r.vendors)||void 0===t?void 0:t.enabled)||[],o=(null===(n=r.vendors)||void 0===n?void 0:n.disabled)||[];return-1!==i.indexOf(e)||-1===o.indexOf(e)&&void 0}},{key:"getUserConsentStatusByPurpose",value:function(e){var t,n,r=this.services.StorageService.getTokenFromLocalStore(),i=(null===(t=r.purposes)||void 0===t?void 0:t.enabled)||[],o=(null===(n=r.purposes)||void 0===n?void 0:n.disabled)||[];return-1!==this.services.WebsiteService.getEssentialPurposes().indexOf(e)||(-1!==i.indexOf(e)||-1===o.indexOf(e)&&void 0)}},{key:"getLegitimateInterestStatusForPurpose",value:function(e){if(2!==this.services.TCFService.getVersion())return!0;var t,n,r=this.services.StorageService.getTokenFromLocalStore(),i=(null===(t=r.purposes_li)||void 0===t?void 0:t.enabled)||[],o=(null===(n=r.purposes_li)||void 0===n?void 0:n.disabled)||[];return-1!==this.services.WebsiteService.getEssentialPurposes().indexOf(e)||(-1!==i.indexOf(e)||-1===o.indexOf(e)&&void 0)}},{key:"getUndefinedPurposes",value:function(){var e,t,n=this.services.StorageService.getTokenFromLocalStore(),r=[].concat(k()(null===(e=n.purposes)||void 0===e?void 0:e.enabled),k()(null===(t=n.purposes)||void 0===t?void 0:t.disabled));return this.services.WebsiteService.getRequiredPurposeIds().filter((function(e){return-1===r.indexOf(e)}))}},{key:"getCommonConsentStatus",value:function(e,t){if(0!==t.length){for(var n=this.getUserConsentStatus(e,t[0].id),r=0,i=t.slice(1);r<i.length;r++){var o=i[r];if(n!==this.getUserConsentStatus(e,o.id))return}return n}}},{key:"setUserConsentStatusDeprecated",value:function(e,t,n){t=Array.isArray(t)?t:[t],n=Array.isArray(n)?n:[n];var r=new I.a(this.getUserStatus.bind(this),this.setUserStatus.bind(this));!0===e?(r.enablePurposes.apply(r,k()(t)),r.enableVendors.apply(r,k()(n))):(r.enablePurposes.apply(r,k()(this.getUndefinedPurposes())),r.disableVendors.apply(r,k()(n))),r.commit()}},{key:"setUserConsentStatus",value:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[],n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[],r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:[],i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:[],o=arguments.length>4&&void 0!==arguments[4]?arguments[4]:[],s=arguments.length>5&&void 0!==arguments[5]?arguments[5]:[],a=arguments.length>6&&void 0!==arguments[6]?arguments[6]:[],u=arguments.length>7&&void 0!==arguments[7]?arguments[7]:[],p=arguments.length>8?arguments[8]:void 0,l=arguments.length>9?arguments[9]:void 0,f=arguments.length>10?arguments[10]:void 0,d=this.services.TCFService.getVersion();t=Array.isArray(t)?t:[t],n=Array.isArray(n)?n:[n],r=Array.isArray(r)?r:[r],i=Array.isArray(i)?i:[i],2===d&&(r=r.filter((function(t){var n=e.services.DatabasesService.getVendor(t);return!n||n.purposeIds.length>0})));var v=this.services.StorageService.getTokenFromLocalStore(),h=Object(c.b)(v),g=this.services.WebsiteService.getEssentialPurposes(),b=function(e){return-1===g.indexOf(e)};h.vendors={enabled:r,disabled:i},h.purposes={enabled:t.filter(b),disabled:n.filter(b)},h.version=d,2===d&&(h.vendors_li={enabled:a,disabled:u},h.purposes_li={enabled:o.filter(b),disabled:s.filter(b)}),p&&(h.created=p),l&&(h.updated=l);var y=!!p||!!l;Object(c.c)(v,h)&&!K(this.store.getState())||(h=this.services.StorageService.setTokenToStorages(h,!y),this.sendEvents(h,!1,f)),this.removeScrollListener(window.scrollListener)}},{key:"sendEvents",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1],n=arguments.length>2?arguments[2]:void 0,r=e.purposes,i=e.purposes_li,o=e.vendors,s=e.vendors_li,a=e.created,c=e.updated,u=e.dns,p=this.services.TCFService.getVersion();"sync"!==n&&this.services.EventsService.sendConsentGiven(X({purposes:r,vendors:o,created:a,updated:c,dns:!0===u||void 0,from_euconsent:t,action:"string"==typeof n?n:void 0},2===p&&{purposes_li:i,vendors_li:s}),"navigate"===n),this.emit("internal.consent.changed"),this.emit("consent.changed",{consentToken:this.getUserConsentTokenDeprecated(),fromEUConsent:t,action:n}),this.setBrowserCookieState(e.purposes.enabled)}},{key:"removeScrollListener",value:function(e){"function"==typeof e&&-1!==String(e).indexOf("Didomi.setUserAgreeToAll()")&&window.removeEventListener("scroll",e)}},{key:"setBrowserCookieState",value:function(e){e.some((function(e){return 0===e.indexOf("cookies")}))&&this.services.CookiesService.enable()}},{key:"getUserStatus",value:function(){return Object(c.b)(Object(Y.i)(this.store.getState()))}},{key:"setUserStatusForAll",value:function(e){var t=e.purposesConsentStatus,n=e.purposesLIStatus,r=e.vendorsConsentStatus,i=e.vendorsLIStatus,o=e.created,s=e.updated,a=e.action,u=this.store.getState(),p=Object(q.g)(u),l=Object(q.q)(u),f=Object(q.t)(u),d=Object(q.w)(u),v=Object(q.v)(u);if(0!==[].concat(k()(l),k()(f)).length&&0!==d.length||0!==p.length){var h={};t?(Object(c.l)(h,"purposes.consent.enabled",l),Object(c.l)(h,"purposes.consent.disabled",[])):(Object(c.l)(h,"purposes.consent.enabled",[]),Object(c.l)(h,"purposes.consent.disabled",l)),n?(Object(c.l)(h,"purposes.legitimate_interest.enabled",f),Object(c.l)(h,"purposes.legitimate_interest.disabled",[])):(Object(c.l)(h,"purposes.legitimate_interest.enabled",[]),Object(c.l)(h,"purposes.legitimate_interest.disabled",f)),r?(Object(c.l)(h,"vendors.consent.enabled",d),Object(c.l)(h,"vendors.consent.disabled",[])):(Object(c.l)(h,"vendors.consent.enabled",[]),Object(c.l)(h,"vendors.consent.disabled",d)),i?(Object(c.l)(h,"vendors.legitimate_interest.enabled",v),Object(c.l)(h,"vendors.legitimate_interest.disabled",[])):(Object(c.l)(h,"vendors.legitimate_interest.enabled",[]),Object(c.l)(h,"vendors.legitimate_interest.disabled",v)),Object(c.l)(h,"created",o),Object(c.l)(h,"updated",s),Object(c.l)(h,"action",a),this.setUserStatus(h)}}},{key:"setUserStatus",value:function(e){this.setUserConsentStatus(Object(c.f)(e,"purposes.consent.enabled",[]),Object(c.f)(e,"purposes.consent.disabled",[]),Object(c.f)(e,"vendors.consent.enabled",[]),Object(c.f)(e,"vendors.consent.disabled",[]),Object(c.f)(e,"purposes.legitimate_interest.enabled",[]),Object(c.f)(e,"purposes.legitimate_interest.disabled",[]),Object(c.f)(e,"vendors.legitimate_interest.enabled",[]),Object(c.f)(e,"vendors.legitimate_interest.disabled",[]),Object(c.f)(e,"created"),Object(c.f)(e,"updated"),Object(c.f)(e,"action")),this.services.WebsiteService.shouldConsentBeCollected()||this.services.NoticeService.hide()}}]),n}(M);function te(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=y()(e);if(t){var i=y()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return g()(this,n)}}ee.Purposes=N.d,ee.prototype.Purposes=N.d;var ne=function(e){v()(n,e);var t=te(n);function n(){return p()(this,n),t.apply(this,arguments)}return f()(n,[{key:"getConsentStatusByCookieCategory",value:function(e){if(!this.services.UserService.isConsentRequired())return!0;var t=this.services.ConsentService.getUserConsentStatusByPurpose(e);return void 0!==t?t:!0===this.services.ConsentService.getUserConsentStatusByPurpose("cookies")}},{key:"getAllowedCategories",value:function(){var e=["essential"];return this.getConsentStatusByCookieCategory("cookies_analytics")&&e.push("analytics"),this.getConsentStatusByCookieCategory("cookies_marketing")&&e.push("marketing"),this.getConsentStatusByCookieCategory("cookies_social")&&e.push("social"),e}},{key:"enable",value:function(){var e=this.getAllowedCategories();this.emit("cookies.enable",e)}}]),n}(M);function re(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function ie(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?re(Object(n),!0).forEach((function(t){i()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):re(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var oe={id:"google",name:"Google Advertising Products",policyUrl:"https://policies.google.com/privacy",namespace:"didomi"},se=n(14);function ae(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function ce(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?ae(Object(n),!0).forEach((function(t){i()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):ae(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function ue(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=y()(e);if(t){var i=y()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return g()(this,n)}}var pe=function(e){v()(n,e);var t=ue(n);function n(){return p()(this,n),t.apply(this,arguments)}return f()(n,[{key:"init",value:function(){this.TCFVersion=this.services.TCFService.version,this.actualIABVendorList=Object(c.f)(window,"didomiConfig.website.vendors.iab.vendorList")||Object(c.f)(window,"didomiConfig.app.vendors.iab.vendorList")||this.services.TCFService.getIABVendorListCore(!0),this.addPurposesToDatabase([].concat(k()(this.loadIABPurposes()),k()(this.loadIABSpecialFeatures()),[{id:N.d.CookiesAnalytics},{id:N.d.CookiesMarketing},{id:N.d.CookiesSocial}]));var e,t,n=(e=this.TCFVersion,[{id:"*",name:"Any",purposeIds:["cookies"],legIntPurposeIds:[]},{id:"amazon",name:"Amazon",purposeIds:t=Object.keys(N.c[e]),legIntPurposeIds:[],policyUrl:"https://aps.amazon.com/aps/privacy-policy/index.html",namespace:"didomi"},{id:"facebook",name:"Facebook",purposeIds:["cookies"],legIntPurposeIds:[],policyUrl:"https://www.facebook.com/policy.php",namespace:"didomi",namespaces:{google:{current:!0,id:89}}},{id:"twitter",name:"Twitter",purposeIds:["cookies"],legIntPurposeIds:[],policyUrl:"https://twitter.com/privacy",namespace:"didomi"},{id:"whatsapp",name:"Whatsapp",purposeIds:["cookies"],legIntPurposeIds:[],policyUrl:"https://www.whatsapp.com/legal/#privacy-policy",namespace:"didomi"}].concat(k()(1===e?[ie(ie({},oe),{},{purposeIds:[N.d.Cookies,N.d.AdvertisingPersonalization,N.d.Analytics,N.d.ContentPersonalization,N.d.AdDelivery],legIntPurposeIds:[],namespaces:{}})]:[]),[{id:"google-adsense",name:"Google Adsense",purposeIds:t,legIntPurposeIds:[],policyUrl:"https://policies.google.com/technologies/partner-sites",namespace:"didomi"},{id:"google-adx",name:"Google Adx",purposeIds:t,legIntPurposeIds:[],policyUrl:"https://policies.google.com/technologies/partner-sites",namespace:"didomi"},{id:"google-dfp",name:"Google DFP",purposeIds:t,legIntPurposeIds:[],policyUrl:"https://policies.google.com/technologies/partner-sites",namespace:"didomi"},{id:"addthis",name:"AddThis",purposeIds:t,legIntPurposeIds:[],policyUrl:"http://www.addthis.com/privacy",namespace:"didomi"},{id:"salesforce",name:"Salesforce",purposeIds:t,legIntPurposeIds:[],policyUrl:"https://www.salesforce.com/company/privacy/",namespace:"didomi"}]));this.actions.addVendorsToDatabase([].concat(k()(n),k()(this.loadIABVendors(this.actualIABVendorList,n)))),this.actions.addFeaturesToDatabase(this.loadIABFeatures()),this.actions.addSpecialPurposesToDatabase(this.loadIABSpecialPurposes()),this.actions.addStacksToDatabase(this.loadIABStacks())}},{key:"loadIABPurposes",value:function(){return 1===this.TCFVersion?[{id:N.d.Cookies,name:"information_storage_and_access_19227997",description:"information_storage_and_access_description_19227997",namespace:"iab"},{id:N.d.AdvertisingPersonalization,name:"personalisation_20601824",description:"personalisation_description_20601824",namespace:"iab"},{id:N.d.Analytics,name:"measurement_268d0e0",description:"measurement_description_268d0e0",namespace:"iab"},{id:N.d.ContentPersonalization,name:"content_selection_delivery_reporting_10c29447",description:"content_selection_delivery_reporting_description_10c29447",namespace:"iab"},{id:N.d.AdDelivery,name:"ad_selection_delivery_reporting_3fb55e57",description:"ad_selection_delivery_reporting_description_3fb55e57",namespace:"iab"}]:[{id:N.d.Cookies,name:"purpose_1_name",description:"purpose_1_description",descriptionLegal:"purpose_1_description_legal",namespace:"iab"},{id:N.d.SelectBasicAds,name:"purpose_2_name",description:"purpose_2_description",descriptionLegal:"purpose_2_description_legal",namespace:"iab"},{id:N.d.CreateAdsProfile,name:"purpose_3_name",description:"purpose_3_description",descriptionLegal:"purpose_3_description_legal",namespace:"iab"},{id:N.d.SelectPersonalizedAds,name:"purpose_4_name",description:"purpose_4_description",descriptionLegal:"purpose_4_description_legal",namespace:"iab"},{id:N.d.CreateContentProfile,name:"purpose_5_name",description:"purpose_5_description",descriptionLegal:"purpose_5_description_legal",namespace:"iab"},{id:N.d.SelectPersonalizedContent,name:"purpose_6_name",description:"purpose_6_description",descriptionLegal:"purpose_6_description_legal",namespace:"iab"},{id:N.d.MeasureAdPerformance,name:"purpose_7_name",description:"purpose_7_description",descriptionLegal:"purpose_7_description_legal",namespace:"iab"},{id:N.d.MeasureContentPerformance,name:"purpose_8_name",description:"purpose_8_description",descriptionLegal:"purpose_8_description_legal",namespace:"iab"},{id:N.d.MarketResearch,name:"purpose_9_name",description:"purpose_9_description",descriptionLegal:"purpose_9_description_legal",namespace:"iab"},{id:N.d.ImproveProducts,name:"purpose_10_name",description:"purpose_10_description",descriptionLegal:"purpose_10_description_legal",namespace:"iab"}]}},{key:"loadIABVendors",value:function(e,t){for(var n=this,r=[],i=Object(N.n)(t),o=0,s=e.vendors;o<s.length;o++){var a=s[o];if(-1===i.indexOf(a.id)){var c=[];c.push.apply(c,k()((a.purposeIds||[]).map((function(e){return Object(N.j)(e,n.TCFVersion)})))),c.push.apply(c,k()((a.specialFeatureIds||[]).map((function(e){return Object(N.k)(e)})))),r.push(ce(ce(ce({},a),{},{namespace:"iab",purposeIds:c,legIntPurposeIds:(a.legIntPurposeIds||[]).map((function(e){return Object(N.j)(e,n.TCFVersion)}))},1!==this.TCFVersion&&{flexiblePurposeIds:(a.flexiblePurposeIds||[]).map((function(e){return Object(N.j)(e,n.TCFVersion)}))}),1!==this.TCFVersion&&a.id===N.g.google&&ce(ce({},oe),{},{namespaces:{iab2:N.g.google}})))}}return this.actions.setIABVendorList(e),r}},{key:"loadIABSpecialPurposes",value:function(){var e=this.actualIABVendorList.specialPurposes;return e&&Array.isArray(e)?1===this.TCFVersion?[]:e.map((function(e){return ce(ce({},e),{},{name:"special_purpose_".concat(e.id,"_name"),description:"special_purpose_".concat(e.id,"_description"),descriptionLegal:"special_purpose_".concat(e.id,"_description_legal")})})):[]}},{key:"loadIABFeatures",value:function(){var e=this.actualIABVendorList.features;return e&&Array.isArray(e)?1===this.TCFVersion?e.map((function(e){return ce(ce({},e),{},{name:"iab_feature_".concat(e.id,"_name"),description:"iab_feature_".concat(e.id,"_description")})})):e.map((function(e){return ce(ce({},e),{},{name:"feature_".concat(e.id,"_name"),description:"feature_".concat(e.id,"_description"),descriptionLegal:"feature_".concat(e.id,"_description_legal")})})):[]}},{key:"loadIABSpecialFeatures",value:function(){var e=this.actualIABVendorList.specialFeatures;return e&&Array.isArray(e)?1===this.TCFVersion?[]:[{id:N.e.GeolocationData,name:"special_feature_1_name",description:"special_feature_1_description",descriptionLegal:"special_feature_1_description_legal",isSpecialFeature:!0,namespace:"iab"},{id:N.e.DeviceCharacteristics,name:"special_feature_2_name",description:"special_feature_2_description",descriptionLegal:"special_feature_2_description_legal",isSpecialFeature:!0,namespace:"iab"}]:[]}},{key:"loadIABStacks",value:function(){var e=this.actualIABVendorList.stacks;return e&&Array.isArray(e)?1===this.TCFVersion?[]:e.map((function(e){return ce(ce({},e),{},{name:"stack_".concat(e.id,"_name"),description:"stack_".concat(e.id,"_description")})})):[]}},{key:"getPurpose",value:function(e){return Object(c.f)(this.store.getState(),["databases","purposes",e])}},{key:"getPurposes",value:function(){return Object(c.f)(this.store.getState(),"databases.purposes")||{}}},{key:"getSpecialPurpose",value:function(e){return Object(c.f)(this.store.getState(),["databases","specialPurposes",e])}},{key:"getVendor",value:function(e){return Object(c.f)(this.store.getState(),["databases","vendors",e])}},{key:"getFeature",value:function(e){return Object(c.f)(this.store.getState(),["databases","features",e])}},{key:"getVendors",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,t=values(Object(c.f)(this.store.getState(),"databases.vendors")||{});return e&&(t=t.filter((function(t){return t.namespace===e}))),t}},{key:"addPurposesToDatabase",value:function(e){this.actions.addPurposesToDatabase(e)}},{key:"addVendorsToDatabase",value:function(e){this.actions.addVendorsToDatabase(e)}},{key:"loadIABTexts",value:function(){var e=this;return this.services.TCFService.importIABTexts().then((function(t){e.actions.setIABTexts(t.default)}))}},{key:"updateVendor",value:function(e,t){var n=this,r=this.getVendor(e);r&&(t.name&&(r.name=t.name),Array.isArray(t.purposeIds)&&(r.purposeIds=t.purposeIds.filter((function(e){return n.getPurpose(e)}))),Array.isArray(t.legIntPurposeIds)&&(r.legIntPurposeIds=t.legIntPurposeIds.filter((function(e){return n.getPurpose(e)}))),t.policyUrl&&(r.policyUrl=Object(se.b)(t.policyUrl)))}}]),n}(m.a),le=n(20),fe=n.n(le);function de(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function ve(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=y()(e);if(t){var i=y()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return g()(this,n)}}var he=function(e){v()(n,e);var t=ve(n);function n(e,r,i){var o;return p()(this,n),(o=t.call(this,e,r,i)).sentEvents={},o}return f()(n,[{key:"configure",value:function(e){var t={sampleSizes:{}};e&&e.source&&(e.source.type&&"string"==typeof e.source.type&&Object(c.l)(t,"template.source.type",e.source.type),e.source.domain&&"string"==typeof e.source.domain&&Object(c.l)(t,"template.source.domain",e.source.domain));for(var n=this.services.SDKConfigService.get("events").sampleSizes,r=0,i=Object.keys(n);r<i.length;r++){var o=i[r];e&&e.sampleSizes&&"number"==typeof e.sampleSizes[o]?t.sampleSizes[o]=e.sampleSizes[o]:t.sampleSizes[o]=n[o]}this.actions.setEventsConfig(t),window.didomiEventListeners=window.didomiEventListeners||[],window.didomiEventListeners.push({event:"preferences.shownpurposes",listener:this.sendPreferencesPurposesShown.bind(this)},{event:"preferences.shownvendors",listener:this.sendPreferencesVendorsShown.bind(this)},{event:"preferences.clickpurposeagree",listener:this.sendPreferencesPurposeStatusChanged.bind(this)},{event:"preferences.clickpurposedisagree",listener:this.sendPreferencesPurposeStatusChanged.bind(this)},{event:"preferences.clickvendoragree",listener:this.sendPreferencesVendorStatusChanged.bind(this)},{event:"preferences.clickvendordisagree",listener:this.sendPreferencesVendorStatusChanged.bind(this)})}},{key:"customizeEvent",value:function(e){var t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],n=this.store.getState();this.services.WebsiteService.getProviderKey()&&Object(c.l)(e,"source.provider",this.services.WebsiteService.getProviderKey()),this.services.WebsiteService.getAPIKey()&&Object(c.l)(e,"source.key",this.services.WebsiteService.getAPIKey());var r=this.services.UserService.getCountry();r&&Object(c.l)(e,"user.country",r);var i=this.services.UserService.getRegion();i&&Object(c.l)(e,"user.region",i);var o=[];this.services.WebsiteService.isRegulationApplied("gdpr")&&o.push("gdpr"),this.services.WebsiteService.isRegulationApplied("ccpa")&&o.push("ccpa"),Object(c.l)(e,"user.regs",o);var s=this.services.StorageService.getTokenFromLocalStore();s.user_id&&Object(c.l)(e,"user.id",s.user_id);var a=this.services.UserService.getOrganizationUserId();a&&Object(c.l)(e,"user.organization_user_id",a),t&&s&&Object.keys(s).length>0&&Object(c.l)(e,"user.token",s);var u=this.services.ExperimentsService.getCurrentExperiment();u&&Object(c.j)(u.group)&&Object(c.j)(u.id)&&Object(c.i)(u.size)&&(e.experiment=u),this.services.WebsiteService.isTCFEnabled()&&(Object(c.l)(e,"user.tcfcs",this.services.StorageService.getConsentStringFromLocalStore()),Object(c.l)(e,"user.tcfv",this.services.TCFService.version));var p=Object(q.e)(n);p&&Object(c.l)(e,"source.deployment_id",p);var l=Object(q.h)(n);return l&&Object(c.l)(e,"source.domain",l),e}},{key:"send",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null,i=arguments.length>3&&void 0!==arguments[3]&&arguments[3],o=!(arguments.length>4&&void 0!==arguments[4])||arguments[4];if(-1===Object(c.m)(this.eventTypes).indexOf(e))throw new Error("Invalid event type ".concat(e));if("number"==typeof r){if(!n.isUUIDInSample(this.services.UserService.getId(),r))return null}else r=1;var s=this.customizeEvent(Object(c.b)(this.store.getState().events.template),o);return s.type=e,s.rate=r,t&&(s.parameters=t),Object(c.l)(s,"source.beacon",!1),!0===i&&"function"==typeof navigator.sendBeacon?(Object(c.l)(s,"source.beacon",!0),navigator.sendBeacon("".concat(this.services.SDKConfigService.get("apiPath"),"/events?data_format=json"),JSON.stringify(s))):fe.a.ajax({method:"POST",url:"".concat(this.services.SDKConfigService.get("apiPath"),"/events"),body:JSON.stringify(s),headers:{"Content-Type":"application/json"},cors:!0},(function(){})),s}},{key:"sendPageview",value:function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0];void 0===this.sentEvents[this.eventTypes.pageview]&&(this.send(this.eventTypes.pageview,null,this.store.getState().events.sampleSizes.pageview,e),this.sentEvents[this.eventTypes.pageview]=!0)}},{key:"sendConsentAsked",value:function(e,t,n,r,o){if(void 0===this.sentEvents[this.eventTypes.consentAsked]){var s=this.services.TCFService.getVersion();this.send(this.eventTypes.consentAsked,function(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?de(Object(n),!0).forEach((function(t){i()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):de(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}({purposes:e,vendors:t,position:o},2===s&&{purposes_li:n,vendors_li:r}),this.store.getState().events.sampleSizes.consentAsked),this.sentEvents[this.eventTypes.consentAsked]=!0}}},{key:"sendConsentGiven",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1];this.send(this.eventTypes.consentGiven,e,this.store.getState().events.sampleSizes.consentGiven,t)}},{key:"sendPreferencesPurposesShown",value:function(){var e="".concat(this.eventTypes.uiAction,"-preferences.showpurposes");void 0===this.sentEvents[e]&&(this.send(this.eventTypes.uiAction,{action:"preferences.shownpurposes"},this.store.getState().events.sampleSizes.uiActionPreferencesPurposes,!1,!1),this.sentEvents[e]=!0)}},{key:"sendPreferencesVendorsShown",value:function(){var e="".concat(this.eventTypes.uiAction,"-preferences.showvendors");void 0===this.sentEvents[e]&&(this.send(this.eventTypes.uiAction,{action:"preferences.shownvendors"},this.store.getState().events.sampleSizes.uiActionPreferencesVendors,!1,!1),this.sentEvents[e]=!0)}},{key:"sendPreferencesPurposeStatusChanged",value:function(){var e="".concat(this.eventTypes.uiAction,"-preferences.purposechanged");void 0===this.sentEvents[e]&&(this.send(this.eventTypes.uiAction,{action:"preferences.purposechanged"},this.store.getState().events.sampleSizes.uiActionPreferencesPurposeChanged,!1,!1),this.sentEvents[e]=!0)}},{key:"sendPreferencesVendorStatusChanged",value:function(){var e="".concat(this.eventTypes.uiAction,"-preferences.vendorchanged");void 0===this.sentEvents[e]&&(this.send(this.eventTypes.uiAction,{action:"preferences.vendorchanged"},this.store.getState().events.sampleSizes.uiActionPreferencesVendorChanged,!1,!1),this.sentEvents[e]=!0)}}],[{key:"isUUIDInSample",value:function(e,t){return!(!e||36!==e.length||!t||"number"!=typeof t||t<0||t>1)&&parseInt(e.slice(-2),16)/255<=t}}]),n}(m.a);he.prototype.eventTypes={pageview:"pageview",consentAsked:"consent.asked",consentGiven:"consent.given",uiAction:"ui.action"};var ge=n(28);function be(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=y()(e);if(t){var i=y()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return g()(this,n)}}var ye=function(e){v()(n,e);var t=be(n);function n(){return p()(this,n),t.apply(this,arguments)}return f()(n,[{key:"configure",value:function(e){var t=e&&e.id&&e.config,n=e&&"number"==typeof e.size&&e.size>=0&&e.size<=1,r=!1;if(e&&(e.group&&("string"!=typeof e.group||"test"!==e.group&&"control"!==e.group)||(r=!0)),t&&n&&r){if(e.config.experiment&&delete e.config.experiment,e.startDate){var i=Object(ge.a)(e.startDate);return i instanceof Date?(this.actions.setExperimentConfig(e.config),this.actions.setExperimentID(e.id),this.actions.setExperimentSize(e.size),this.actions.setExperimentStartDate(i),e.group&&this.actions.setExperimentGroup(e.group),!0):(console.log("Didomi - The test start date must be a date formatted as an ISO-8601 string"),!1)}return this.actions.setExperimentConfig(e.config),this.actions.setExperimentID(e.id),this.actions.setExperimentSize(e.size),e.group&&this.actions.setExperimentGroup(e.group),!0}return t?n?r||console.log('Didomi - The experiment group must be "control" or "test"'):console.log("Didomi - The test group size must be between 0 and 1"):console.log("Didomi - Experiment requires an ID, a size and a config to run"),!1}},{key:"run",value:function(e){var t=this.store.getState().experiment,n=t.id,r=t.size,i=t.config,o=t.startDate,s=t.group;if(!n||"number"!=typeof r||!i)return null;if(!this.isUserPartOfExperiment(o,e.created))return null;var a=s||this.getUserGroup(e.user_id,r);return a?(this.actions.setExperimentGroup(a),"test"===a?("3e6e3e05-9201-4614-a13e-b9649d1fa0e4"===this.services.SiteConfigService.get("app.apiKey")&&"bas-popin-expc"===n&&(window&&window.utag&&window.utag.data&&window.utag.data["cp.utag_main__pn"]&&parseInt(window.utag.data["cp.utag_main__pn"])>1?Object(c.l)(i,"notice.position","popup"):Object(c.l)(i,"notice.position","bottom")),i):null):null}},{key:"isUserPartOfExperiment",value:function(e,t){if(!e)return!0;var n=Object(ge.a)(t);return n instanceof Date&&e.getTime()<=n.getTime()}},{key:"getCurrentExperiment",value:function(){var e=this.store.getState().experiment;return e.id?{group:e.group,id:e.id,size:e.size,startDate:e.startDate instanceof Date?e.startDate.toISOString():null}:null}},{key:"getUserGroup",value:function(e,t){return e&&36===e.length?0===t?"control":parseInt(e.slice(-5),16)%1e3<1e3*t?"test":"control":null}}]),n}(m.a),me=function(){function e(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},n=arguments.length>1?arguments[1]:void 0;p()(this,e),this.previousGoogleStatusForRefresh=void 0,this.requireCookieConsent="boolean"!=typeof t.eprivacy||t.eprivacy,this.refresh="boolean"!=typeof t.refresh||t.refresh,this.refreshOnConsent="boolean"!=typeof t.refreshOnConsent||t.refreshOnConsent,this.consentPassedToDFPEvents=0,this.emit=n||function(){},this.passTargetingVariables=!0===t.passTargetingVariables}return f()(e,[{key:"setConsentStatus",value:function(e,t,n,r){var i=this,o=!0===e?0:1;window.googletag||(window.googletag={}),window.googletag.cmd=window.googletag.cmd||[],window.googletag.cmd.push((function(){i.passTargetingVariables&&(window.googletag.pubads().setTargeting("iabconsentstring",n),window.googletag.pubads().setTargeting("iabgdprapplies",r?"1":"0")),window.googletag.pubads().setRequestNonPersonalizedAds(o)})),window.adsbygoogle||(window.adsbygoogle=[]),window.adsbygoogle.requestNonPersonalizedAds=o,this.emit("integrations.consentpassedtodfp",{consentStatus:e,index:this.consentPassedToDFPEvents}),this.consentPassedToDFPEvents+=1,this.refresh&&(!0===t||this.refreshOnConsent)&&(!0!==e&&this.requireCookieConsent||0!==this.previousGoogleStatusForRefresh&&this.previousGoogleStatusForRefresh!==o&&(this.previousGoogleStatusForRefresh=o,this.resumeAdRequests()))}},{key:"resumeAdRequests",value:function(){window.googletag||(window.googletag={}),window.googletag.cmd=window.googletag.cmd||[],window.googletag.cmd.push((function(){if(window.googletag.pubadsReady)window.googletag.pubads().refresh();else var e=0,t=setInterval((function(){e+=40,window.googletag.pubadsReady?(window.googletag.pubads().refresh(),clearInterval(t)):e>=1e4&&clearInterval(t)}),40)})),window.adsbygoogle||(window.adsbygoogle=[]),window.adsbygoogle.pauseAdRequests=0}}]),e}(),Se=function(){function e(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};p()(this,e),this.config=t}return f()(e,[{key:"setConsentStatus",value:function(e,t){if(!0!==t){var n={dc:!0===e,al:!0===e,tg:!0===e,cd:!0===e,sh:!0===e,re:!1};if(window.Krux||((window.Krux=function(){window.Krux.q.push(arguments)}).q=[]),this.config.namespace){var r=this.config.namespace;-1===r.indexOf("ns:")&&(r="ns:".concat(r)),window.Krux(r,"consent:set",n)}else window.Krux("consent:set",n)}}}]),e}(),Oe=n(31),Ce=n.n(Oe),we="granted",Pe="denied",ke="ad",je="analytics",_e="functionality",Ie="personalization",Ae="security",Te=Pe,Ee=function(){function e(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};p()(this,e),this.config=t,this.dataLayerName="dataLayer","string"==typeof t.dataLayerName&&t.dataLayerName.length>0&&(this.dataLayerName=t.dataLayerName),window[this.dataLayerName]||(window[this.dataLayerName]=[]),this.setGoogleDeveloperId()}return f()(e,[{key:"pushToDataLayer",value:function(){window[this.dataLayerName]&&"function"==typeof window[this.dataLayerName].push&&window[this.dataLayerName].push(arguments)}},{key:"setGoogleDeveloperId",value:function(){this.pushToDataLayer("set","developer_id.dMTc4Zm",!0)}},{key:"setConsentStatus",value:function(e){if(!0!==e){var t=Ce()(e,2),n=t[0],r=t[1];void 0===n&&void 0===r?this.handleInitialPageLoad():this.handleConsentUpdate(n,r)}else this.handleInitialPageLoad()}},{key:"handleInitialPageLoad",value:function(){!0===this.config.setDefaultStatus&&this.pushToDataLayer("consent","default",{ad_storage:this.getDefaultGCMPurposeStatus(ke),analytics_storage:this.getDefaultGCMPurposeStatus(je),functionality_storage:this.getDefaultGCMPurposeStatus(_e),personalization_storage:this.getDefaultGCMPurposeStatus(Ie),security_storage:this.getDefaultGCMPurposeStatus(Ae)})}},{key:"handleConsentUpdate",value:function(e,t){this.pushToDataLayer("consent","update",{ad_storage:this.getGCMPurposeStatus(e),analytics_storage:this.getGCMPurposeStatus(t),functionality_storage:this.getGCMPurposeStatus(e),personalization_storage:this.getGCMPurposeStatus(e),security_storage:this.getGCMPurposeStatus(!0)})}},{key:"getGCMPurposeStatus",value:function(e){return!0===e?we:Pe}},{key:"getDefaultGCMPurposeStatus",value:function(e){if("security"===e)return we;var t=Object(c.f)(this.config,"defaultStatus.".concat(e));return"boolean"==typeof t?this.getGCMPurposeStatus(t):Te}}]),e}(),Le=[{id:"google",cls:me,vendorIds:["google",N.g.google,"c:google"],usesMultipleVendors:!1},{id:"salesforce-dmp",cls:Se,vendorIds:["salesforce",N.g.salesforce,"c:salesforce"],usesMultipleVendors:!1},{id:"gcm",cls:Ee,vendorIds:["google","c:googleana-4TXnJigR"],usesMultipleVendors:!0}];function De(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function xe(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?De(Object(n),!0).forEach((function(t){i()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):De(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function Re(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=y()(e);if(t){var i=y()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return g()(this,n)}}var Ve=function(e){v()(n,e);var t=Re(n);function n(e,r,i){var o;return p()(this,n),(o=t.call(this,e,r,i)).providers=[],o}return f()(n,[{key:"configure",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=!1!==e.refreshOnConsent;if(e.vendors)for(var n=e.vendors,r=0;r<Le.length;r++){var i=Le[r];if(n[i.id]&&!0===n[i.id].enable){var o=xe({refreshOnConsent:t},n[i.id]);this.providers.push({vendorIds:i.vendorIds,provider:new i.cls(o,this.emit.bind(this)),parameters:o,usesMultipleVendors:i.usesMultipleVendors})}}}},{key:"run",value:function(){var e=this;if(!1===this.services.UserService.isConsentRequired())for(var t=0,n=this.providers;t<n.length;t++){n[t].provider.setConsentStatus(!0,!0,"",!1)}else this.updateProviders(!0),this.services.ConsentService.on("internal.consent.changed",(function(){return e.updateProviders(!1)}))}},{key:"updateProviders",value:function(e){for(var t=this,n=this.services.TCFService.getConsentData(1),r=0,i=this.providers;r<i.length;r++){var o=i[r],s=o.vendorIds.map((function(e){return t.services.ConsentService.getUserConsentStatusForAllPurposesByVendor(e)})),a=o.usesMultipleVendors?s:s.filter((function(e){return void 0!==e}))[0];o.provider.setConsentStatus(a,e,n.consentData,n.gdprApplies)}}}]),n}(M);function Be(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=y()(e);if(t){var i=y()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return g()(this,n)}}var Fe=function(e){v()(n,e);var t=Be(n);function n(){return p()(this,n),t.apply(this,arguments)}return f()(n,[{key:"configure",value:function(e){if(e){var t=e.denyOptions,n=e.type;t&&t.button&&"none"!==t.button&&!t.link&&!n&&(e.type="optin"),this.actions.setConsentNoticeConfig(e)}}},{key:"isEnabled",value:function(){return Object(c.f)(this.store.getState(),"consentNotice.enable")}},{key:"isVisible",value:function(){return Object(c.f)(this.store.getState(),"consentNotice.show")||!1}},{key:"getPosition",value:function(){return Object(c.f)(this.store.getState(),"consentNotice.position")||"top"}},{key:"getDaysBeforeShowingAgain",value:function(){return Object(c.f)(this.store.getState(),"consentNotice.daysBeforeShowingAgain")||0}},{key:"showDataProcessing",value:function(){return Object(c.f)(this.store.getState(),"consentNotice.showDataProcessing")}},{key:"getEnableBulkActionOnPurposes",value:function(){return Object(c.f)(this.store.getState(),"consentNotice.enableBulkActionOnPurposes")}},{key:"uiLoaded",value:function(){!0===this.store.getState().consentNotice.showOnUILoad&&(this.actions.showConsentNotice(),(!this.isEnabled()&&!this.services.PreferencesService.shouldShowWhenConsentIsMissing()||this.isEnabled())&&this.emit("notice.shown"))}},{key:"show",value:function(){this.isVisible()||(this.actions.showConsentNoticeOnLoad(),this.services.UIService.load(this.uiLoaded.bind(this)))}},{key:"hide",value:function(){this.isVisible()&&this.emit("notice.hidden"),this.actions.hideConsentNotice()}},{key:"close",value:function(){this.hide(),this.emit("notice.clickclose")}}]),n}(M);function Ue(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function Me(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?Ue(Object(n),!0).forEach((function(t){i()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):Ue(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function Ne(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=y()(e);if(t){var i=y()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return g()(this,n)}}var ze=function(e){v()(n,e);var t=Ne(n);function n(){return p()(this,n),t.apply(this,arguments)}return f()(n,[{key:"configure",value:function(e){if(e){!0===Object(c.f)(e,"information.enable")&&(e.view="information");var t=[];if(e.categories)for(var n=0,r=e.categories;n<r.length;n++){var i=r[n],o=this.validateCategory(i);o&&t.push(o)}this.actions.setConsentPopupConfig(Me(Me({},e),{},{categories:t}))}}},{key:"validateCategory",value:function(e){if(e.purposeId||e.id){if(/^[A-Za-z0-9-_]+$/.test(e.id)){if(e.children){for(var t=[],n=0,r=e.children;n<r.length;n++){var i=r[n],o=this.validateCategory(i);o&&t.push(o)}e.children=t}return e}return console.error('Didomi - The category ID "'.concat(e.id,'" is not valid. Ignoring it.')),null}return console.error("Didomi - The category/purpose ID is undefined. Ignoring it."),null}},{key:"shouldShowWhenConsentIsMissing",value:function(){return Object(c.f)(this.store.getState(),"consentPopup.showWhenConsentIsMissing")||!1}},{key:"isEnabled",value:function(){return Object(c.f)(this.store.getState(),"consentPopup.enable")}},{key:"isVisible",value:function(){return Object(c.f)(this.store.getState(),"consentPopup.open")||!1}},{key:"isInformationEnabled",value:function(){return Object(c.f)(this.store.getState(),"consentPopup.information.enable")||!1}},{key:"uiLoaded",value:function(e){"information"===e?this.isInformationEnabled()&&(this.isVisible()||this.emit("preferences.shown"),this.actions.showConsentPopup(),this.actions.switchViewConsentPopup(e)):(this.isVisible()||this.emit("preferences.shown"),this.actions.showConsentPopup(),-1!==["purposes","vendors"].indexOf(e)?(this.actions.switchViewConsentPopup("preferences"),this.actions.switchPreferencesViewConsentPopup(e)):this.isInformationEnabled()?this.actions.switchViewConsentPopup("information"):(this.actions.switchViewConsentPopup("preferences"),this.actions.switchPreferencesViewConsentPopup("purposes")))}},{key:"show",value:function(e){this.services.UIService.load(this.uiLoaded.bind(this,e))}},{key:"hide",value:function(){this.isVisible()&&(this.actions.hideConsentPopup(),this.emit("preferences.hidden"))}},{key:"getCategories",value:function(){return Object(c.f)(this.store.getState(),"consentPopup.categories")||[]}}]),n}(M),Ge=function(){function e(t,n){var r=this;p()(this,e),this.windowVarCall=t,this.windowVarReadys=n||[t],this.createCondition(this.windowVarReadys,window)?this.loaded=!0:(this.loaded=!1,this.loading=new Promise((function(e){Object(se.l)((function(t){r.createCondition(r.windowVarReadys,window)&&(r.loaded=!0,e(),t())}),100,3e4)})))}return f()(e,[{key:"createCondition",value:function(e,t){return e.reduce((function(e,n){var r=Array.isArray(n)?n.reduce((function(e,n){return e||Boolean(Object(c.f)(t,n))}),!1):Object(c.f)(t,n);return e&&Boolean(r)}),!0)}},{key:"call",value:function(e){for(var t=this,n=arguments.length,r=new Array(n>1?n-1:0),i=1;i<n;i++)r[i-1]=arguments[i];if(!this.loaded)return this.loading.then((function(){t.doCall.apply(t,[t.windowVarCall,e].concat(r))}));this.doCall.apply(this,[this.windowVarCall,e].concat(r))}},{key:"doCall",value:function(e,t){var n=Object(c.f)(window,e,{}),r=n[t];if(r&&"function"==typeof r){for(var i=arguments.length,o=new Array(i>2?i-2:0),s=2;s<i;s++)o[s-2]=arguments[s];r.call.apply(r,[n].concat(o))}}}]),e}(),qe=function(){function e(){p()(this,e),this.satellite=new Ge("_satellite")}return f()(e,[{key:"setup",value:function(e,t){for(var n in t)this.satellite.call("setVar",n,t[n]);e?this.satellite.call("track","didomi-ready"):this.satellite.call("track","didomi-consent-changed")}}]),e}(),We=n(19),Ke=function(){function e(){p()(this,e),this.tC=new Ge("tC.event",["tC.domReady",["tC.event.didomiConsent","tC.event.didomiReady","tC.event.didomiConsentChanged"]])}return f()(e,[{key:"setupVendors",value:function(e,t){this.tC.call("didomiConsent",{},t),e?this.tC.call("didomiReady",{},t):this.tC.call("didomiConsentChanged",{},t)}},{key:"setup",value:function(e,t,n,r,i,o,s,a){this.setupCookies(a),this.setupVendors(e,t)}},{key:"setupCookies",value:function(e){var t=e.join(",");We.b("didomi_cookies")!==t&&We.d("didomi_cookies",t,365)}}]),e}();function He(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function Je(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?He(Object(n),!0).forEach((function(t){i()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):He(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var Qe=function(){function e(){p()(this,e)}return f()(e,[{key:"setup",value:function(e,t,n,r,i,o,s,a){var c=this;window.didomiState={};for(var u=0,p=Object.keys(t);u<p.length;u++){var l=p[u];window.didomiState[l]=t[l]}"complete"!==document.readyState&&window.addEventListener("load",(function(){return c.enableTags(n,r,i.allowed,a,s.allowed,o.allowed)})),this.enableTags(n,r,i.allowed,a,s.allowed,o.allowed)}},{key:"enableTags",value:function(e,t,n,r,i,o){var s=[{attribute:"data-category",values:r},{attribute:"data-vendor",values:n},{attribute:"data-vendor-raw",values:o},{attribute:"data-purposes",attributeIsList:!0,values:i}],a={gdpr:e?1:0,gdpr_consent:t};this.enableTagsByName('script[type="didomi/javascript"]',"script",s,a),this.enableTagsByName('script[type="didomi/html"]',"div",s,a)}},{key:"enableTagsByName",value:function(e,t,n,r){for(var i=this,o=document.querySelectorAll(e),s=function(e){var s=o[e],a=!0;"true"!==s.getAttribute("data-processed")&&(n.filter((function(e){var t=e.attribute;return s.hasAttribute(t)})).map((function(e){var t=e.attribute,n=e.attributeIsList,o=e.values;if("immediate"===s.getAttribute("data-loading")||o.length>0){var c=s.getAttribute(t);if("data-vendor"===t&&(r=Je(Je({},r),i.addVendorsRelatedMacros(-1!==o.indexOf(String(c))))),"data-vendor-raw"===t&&(r=Je(Je({},r),i.addVendorsRawRelatedMacros(-1!==o.indexOf(String(c))))),"immediate"!==s.getAttribute("data-loading"))if(!0===n){for(var u=String(c).split(","),p=!0,l=0;l<u.length;l++){var f=u[l];f.length>0&&(p=p&&-1!==o.indexOf(String(f)))}!1===p&&(a=!1)}else-1===o.indexOf(String(c))&&(a=!1)}else a=!1;return null})),!0===a&&i.replaceTags(t,s,r))},a=0;a<o.length;a++)s(a)}},{key:"replaceMacros",value:function(e,t){for(var n=0,r=Object.keys(e);n<r.length;n++){var i=r[n],o=new RegExp("{".concat(i,"}"),"gi");t=t.replace(o,e[i])}return t}},{key:"replaceTags",value:function(e,t,n){var r=document.createElement(e);"script"===e&&(r.type="text/javascript"),r.innerHTML=this.replaceMacros(n,t.innerHTML);for(var i=0,o=t.attributes;i<o.length;i++){var s=o[i];"type"!==s.name&&r.setAttribute(s.name,s.value)}t.parentNode.insertBefore(r,t),t.setAttribute("data-processed",!0)}},{key:"addVendorsRelatedMacros",value:function(e){return{gdpr_consent_vendor:e?1:0,gdpr_consent_vendor_boolean:e}}},{key:"addVendorsRawRelatedMacros",value:function(e){return{gdpr_consent_vendor_raw:e?1:0,gdpr_consent_vendor_boolean_raw:e}}}]),e}(),Ye=function(){function e(){var t=this;p()(this,e),this.vendorsCalled=[],this.isContainerLoaded=!1,this.containerLoading=new Promise((function(e){Object(se.l)((function(n){window._oEa&&window.EA_collector&&window.EA_epmEnd&&(window._oEa.cookieset("didomi_eulerian",1,1),t.isContainerLoaded=!0,e(),n())}),100,3e4)}))}return f()(e,[{key:"send",value:function(e){var t=this,n=window.EA_epmGet().filter((function(e){return!e.noconsent})).map((function(n){return-1!==e.didomiVendorsConsent.indexOf("".concat(n.name,","))&&-1===t.vendorsCalled.indexOf(n.name)?(n.allowed=!0,n.denied=!1,t.vendorsCalled.push(n.name)):(n.allowed=!1,n.denied=!0),n}));n.filter((function(e){return e.allowed})).length>0&&(window.EA_epmSet(n),window.EA_epmEnd())}},{key:"setup",value:function(e,t,n,r,i,o,s,a){var c=this;this.isContainerLoaded?this.send(t):this.containerLoading.then((function(){c.send(t)}))}}]),e}(),Ze=function(){function e(){var t=this;p()(this,e),this.isContainerLoaded=!1,this.containerLoading=new Promise((function(e){Object(se.l)((function(n){window._oEa&&window.EA_collector&&(t.isContainerLoaded=!0,e(),n())}),100,3e4)}))}return f()(e,[{key:"send",value:function(e){var t=e.didomiVendorsConsent.split(",").filter((function(e){return-1===e.indexOf("iab:")})).join(",");window.EA_collector(["cmp-customvendor-allowed",t])}},{key:"setup",value:function(e,t){var n=this;this.isContainerLoaded?this.send(t):this.containerLoading.then((function(){n.send(t)}))}}]),e}();function Xe(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function $e(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?Xe(Object(n),!0).forEach((function(t){i()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):Xe(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function et(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function tt(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?et(Object(n),!0).forEach((function(t){i()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):et(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function nt(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=y()(e);if(t){var i=y()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return g()(this,n)}}var rt={adobe:qe,commandersact:Ke,didomi:Qe,gtm:function(){function e(t){p()(this,e),this.dataLayerName="dataLayer",t&&"string"==typeof t.dataLayerName&&t.dataLayerName.length>0&&(this.dataLayerName=t.dataLayerName),window[this.dataLayerName]||(window[this.dataLayerName]=[])}return f()(e,[{key:"pushToDataLayer",value:function(e){window[this.dataLayerName]&&"function"==typeof window[this.dataLayerName].push&&window[this.dataLayerName].push(e)}},{key:"setup",value:function(e,t,n,r,i,o,s,a){this.setupCookies(a),this.setupVendors(e,t)}},{key:"setupCookies",value:function(e){0!==e.length&&(1===e.length&&"essential"===e[0]||this.pushToDataLayer({event:"didomi-cookies-consent",didomiCookiesConsent:e.join(",")}))}},{key:"setupVendors",value:function(e,t){this.pushToDataLayer($e({event:"didomi-consent"},t)),e?this.pushToDataLayer($e({event:"didomi-ready"},t)):this.pushToDataLayer($e({event:"didomi-consent-changed"},t))}}]),e}(),tealium:function(){function e(){p()(this,e),this.utag=new Ge("utag")}return f()(e,[{key:"setup",value:function(e,t){e?this.utag.call("link",tt({tealium_event:"didomi-ready"},t)):this.utag.call("link",tt({tealium_event:"didomi-consent-changed"},t))}}]),e}(),eulerian:Ye,"eulerian-v2":Ze},it=function(e){v()(n,e);var t=nt(n);function n(e,r,i){var o;return p()(this,n),(o=t.call(this,e,r,i)).providers={},o.oldAllowedCategories=[],o.oldVendorsByStatus={allowed:[],unknown:[],denied:[]},o.oldPurposesByStatus={allowed:[],unknown:[],denied:[]},o}return f()(n,[{key:"configure",value:function(e,t){rt[e]?this.providers[e]||(this.providers[e]=new rt[e](t)):console.error('Didomi SDK - The tag manager "'.concat(e,'" is not supported. Possible values: ').concat(Object.keys(rt).join(", ")))}},{key:"run",value:function(){var e=this,t=Object(c.m)(this.providers);t.length>0&&(this.setup(t,!0),this.services.CookiesService.on("cookies.enable",(function(){e.setup(t,!1)})),this.services.ConsentService.on("internal.consent.changed",(function(){e.setup(t,!1)})))}},{key:"areStatusDifferent",value:function(e,t){return!Object(c.a)(e.allowed,t.allowed)||!Object(c.a)(e.unknown,t.unknown)||!Object(c.a)(e.denied,t.denied)}},{key:"areCategoriesDifferent",value:function(e){return!Object(c.a)(e,this.oldAllowedCategories)}},{key:"getVendorsByStatus",value:function(){for(var e={allowed:[],denied:[],unknown:[]},t={allowed:[],denied:[],unknown:[]},n=this.services.WebsiteService.getRequiredVendors(),r=0;r<n.length;r++){var i=n[r],o=this.services.ConsentService.getUserStatusForVendor(i.id),s=this.services.ConsentService.getUserStatusForVendorAndLinkedPurposes(i.id),a="";a="didomi"===i.namespace||"iab"===i.namespace?"".concat(i.namespace,":").concat(i.id):i.id,!0!==s&&this.services.UserService.isConsentRequired()?!1===s?e.denied.push(a):e.unknown.push(a):e.allowed.push(a),!0!==o&&this.services.UserService.isConsentRequired()?!1===o?t.denied.push(a):t.unknown.push(a):t.allowed.push(a)}return{vendorsByStatusWithPurposes:e,vendorsByStatusWithoutPurposes:t}}},{key:"getPurposesByStatus",value:function(){for(var e=[],t=[],n=[],r=this.services.WebsiteService.getRequiredPurposeIds(),i=0;i<r.length;i++){var o=r[i],s=this.services.ConsentService.getUserConsentStatusByPurpose(o);!0!==s&&this.services.UserService.isConsentRequired()?!1===s?n.push(o):t.push(o):e.push(o)}return{allowed:e,unknown:t,denied:n}}},{key:"getCustomVariables",value:function(e,t,n,r,i,o){var s={didomiGDPRApplies:e,didomiIABConsent:t||"",didomiVendorsConsent:this.formatStatusString(n.allowed),didomiVendorsConsentUnknown:this.formatStatusString(n.unknown),didomiVendorsConsentDenied:this.formatStatusString(n.denied),didomiVendorsRawConsent:this.formatStatusString(r.allowed),didomiVendorsRawConsentUnknown:this.formatStatusString(r.unknown),didomiVendorsRawConsentDenied:this.formatStatusString(r.denied),didomiPurposesConsent:this.formatStatusString(i.allowed),didomiPurposesConsentUnknown:this.formatStatusString(i.unknown),didomiPurposesConsentDenied:this.formatStatusString(i.denied),didomiExperimentId:"",didomiExperimentUserGroup:""};return o&&(s.didomiExperimentId=o.id||"",s.didomiExperimentUserGroup=o.group||""),s}},{key:"formatStatusString",value:function(e){return Array.isArray(e)&&e.length>0?"".concat(e.join(","),","):""}},{key:"setup",value:function(e,t){var n=this.services.CookiesService.getAllowedCategories(),r=this.getVendorsByStatus(),i=r.vendorsByStatusWithPurposes,o=r.vendorsByStatusWithoutPurposes,s=this.getPurposesByStatus();if(t||this.areStatusDifferent(i,this.oldVendorsByStatus)||this.areStatusDifferent(s,this.oldPurposesByStatus)||this.areCategoriesDifferent(n)){this.oldVendorsByStatus=i,this.oldPurposesByStatus=s,this.oldAllowedCategories=n;for(var a=this.services.UserService.isConsentRequired()?1:0,c=this.services.TCFService.getConsentData().consentData,u=this.services.ExperimentsService.getCurrentExperiment(),p=this.getCustomVariables(a,c,i,o,s,u),l=0;l<e.length;l++){e[l].setup(t,p,a,c||"",i,o,s,n,u)}}}}]),n}(m.a),ot=n(11),st=n.n(ot),at={crawlers:/googlebot|adsbot|feedfetcher|mediapartners|bingbot|bingpreview|slurp|linkedin|msnbot|teoma|alexabot|exabot|facebot|facebook|twitter|yandex|baidu|duckduckbot|qwant|archive|applebot|addthis|slackbot|reddit|whatsapp|pinterest|moatbot|google-xrawler|crawler|spider|crawling|oncrawl|NETVIGIE|PetalBot|PhantomJS|NativeAIBot|Cocolyzebot|SMTBot|EchoboxBot|Quora-Bot|scraper|BLP_bbot|MAZBot|ScooperBot|BublupBot|Cincraw|HeadlessChrome|diffbot|Google Web Preview|Doximity-Diffbot|Rely Bot|pingbot|cXensebot|PingdomTMS|AhrefsBot|robot|semrush|seenaptic|netvibes|taboolabot|SimplePie|APIs-Google|Google-Read-Aloud|googleweblight|DuplexWeb-Google|Google Favicon|Storebot-Google|TagInspector|Rigor|Bazaarvoice|KlarnaBot|pageburst|naver|iplabel/i,performance:/Chrome-Lighthouse|gtmetrix|speedcurve|DareBoost|PTST|StatusCake_Pagespeed_Indev/i};function ct(e,t,n){var r=[];if(Array.isArray(e))for(var i=0;i<e.length;i++){var o=e[i],s=at[o];s?r.push(s):console.error('Didomi - Bot detector - Bot type "'.concat(o,'" does not exist'))}if(Array.isArray(t))for(var a=0;a<t.length;a++){var c=t[a];try{if(!c||"string"!=typeof c)throw new Error("User-Agent cannot be null, undefined or an empty string");r.push(new RegExp(c))}catch(e){console.error('Didomi - Bot detector - User-agent "'.concat(c,'" is not a valid regular expression: ').concat(e.message))}}return r.filter((function(e){return e.test(n)})).length>0}var ut=n(30);function pt(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=y()(e);if(t){var i=y()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return g()(this,n)}}var lt=function(e){v()(n,e);var t=pt(n);function n(){return p()(this,n),t.apply(this,arguments)}return f()(n,[{key:"configure",value:function(e){if(e){var t=e.authToken,n=e.organizationUserIdExp,r=e.ignoreConsentBefore;if(t){var i=Object(W.d)(t);i&&(e.organizationId=i.organization_id,e.organizationUserId=i.sub)}null!==e.organizationUserId&&""!==e.organizationUserId||(delete e.organizationUserId,console.error('Didomi - Authorization Parameters configuration: Invalid Organization User Id "'.concat(e.organizationUserId,'". The value will be ignored'))),n&&!Object(c.i)(n)&&(delete e.organizationUserIdExp,console.error('Didomi - Authorization Parameters configuration: Invalid Organization User Digest Expired timestamp "'.concat(n,'". The value will be ignored'))),r&&(e.ignoreConsentBefore=Object(ge.a)(r)||null),this.actions.setUserConfig(e)}var o=Object(c.f)(this.store.getState(),"user.bots",{});this.actions.setUserConfig({isBot:ct(o.types,o.extraUserAgents,navigator.userAgent)})}},{key:"getCountry",value:function(){return Object(c.f)(this.store.getState(),"user.country")||null}},{key:"getRegion",value:function(){return Object(c.f)(this.store.getState(),"user.region")||null}},{key:"getId",value:function(){return this.services.StorageService.getTokenFromLocalStore().user_id||null}},{key:"getAuthToken",value:function(){var e=this.store.getState();return Object(c.f)(e,"user.authToken")?Object(c.f)(e,"user.authToken"):this.shouldReadTokenFromURL()?Object(se.e)("token"):this.shouldReadTokenFromLocalStorage()?Object(ut.b)("didomi_auth_token"):null}},{key:"getOrganizationId",value:function(){var e=this.store.getState();return Object(c.f)(e,"user.organizationId")||null}},{key:"getAuthorizationParameters",value:function(){return Q(this.store.getState())}},{key:"getOrganizationUserId",value:function(){return J(this.store.getState())}},{key:"getGeoFromWindow",value:function(){return{country:"string"==typeof window.didomiCountry&&2===window.didomiCountry.length?window.didomiCountry.toUpperCase():null,region:"string"==typeof window.didomiRegion&&window.didomiRegion.length>0?window.didomiRegion.toUpperCase():null}}},{key:"getGeoFromURL",value:function(){var e=/didomi_country=([a-zA-Z]{2})/.exec(window.location.search),t=/didomi_region=([a-zA-Z]{2})/.exec(window.location.search);return{country:e?e[1]:null,region:t?t[1]:null}}},{key:"initLocation",value:function(e){var t=this;if("function"==typeof e){var n=this.getGeoFromURL(),r=this.getGeoFromWindow(),i={country:n.country||r.country||null,region:n.region||r.region||null};i.country&&"US"!==i.country?(this.actions.setUserLocation(i.country,null),e(null,i.country,null)):i.country&&i.region?(this.actions.setUserLocation(i.country,i.region),e(null,i.country,i.region)):window.gdprAppliesGlobally&&"US"!==i.country?(this.actions.setUserLocation(i.country,null),e(!0)):fe.a.ajax({method:"GET",url:"".concat(this.services.SDKConfigService.get("apiPath"),"/locations/current?fields[]=country_code&fields[]=region_code"),headers:{"Content-Type":"application/json"},cors:!0},(function(n,r){if(200===n)try{var i=JSON.parse(r);i.country_code&&t.actions.setUserLocation(i.country_code,i.region_code),e(null,i.country_code,i.region_code)}catch(t){e(!0)}else e(!0)}))}}},{key:"isConsentRequired",value:function(){if(this.services.WebsiteService.isRegulationApplied("ccpa"))return!1;var e=Object(c.f)(this.store.getState(),"user",{});return(!e.bots||!1!==e.bots.consentRequired||!e.isBot)&&(!0===Object(c.f)(this.store.getState(),"website.ignoreCountry")||!!this.isSubjectToRegulation("gdpr"))}},{key:"isSubjectToRegulation",value:function(e){return!0===this.store.getState().user.regulations[e]}},{key:"getExternalConsent",value:function(){return this.store.getState().user.externalConsent}},{key:"loadExternalConsent",value:function(){var e=this.getExternalConsent();if(e.enabled&&e.value&&"object"===st()(e.value)){var t=e.value;if(t.purposes||t.vendors)this.services.ConsentService.setUserStatus(t);else{var n=t.disabledPurposes,r=t.disabledVendors,i=t.enabledPurposes,o=t.enabledVendors,s=t.enabledPurposesLegitimateInterests,a=t.disabledPurposesLegitimateInterests,c=t.enabledVendorsLegitimateInterests,u=t.disabledVendorsLegitimateInterests,p=t.action;this.services.ConsentService.setUserConsentStatus(i,n,o,r,s,a,c,u,void 0,void 0,p)}}}},{key:"shouldReadTokenFromURL",value:function(){return this.store.getState().user.shouldReadTokenFromURL}},{key:"shouldReadTokenFromLocalStorage",value:function(){return this.store.getState().user.shouldReadTokenFromLocalStorage}},{key:"getUserId",value:function(){var e=this.store.getState();return Object(c.f)(e,"user.id")||null}}]),n}(m.a),ft=n(13);function dt(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function vt(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?dt(Object(n),!0).forEach((function(t){i()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):dt(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function ht(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=y()(e);if(t){var i=y()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return g()(this,n)}}var gt=function(e){v()(n,e);var t=ht(n);function n(){return p()(this,n),t.apply(this,arguments)}return f()(n,[{key:"configure",value:function(e){var t=this;if(this.TCFVersion=this.services.TCFService.getVersion(),e){var n={};if(void 0!==e.ignoreCountry&&(n.ignoreCountry=e.ignoreCountry),void 0!==e.privacyPolicyURL&&(n.privacyPolicyURL=e.privacyPolicyURL),void 0!==e.name&&(n.name=e.name),"string"==typeof e.apiKey&&(n.apiKey=e.apiKey),"string"==typeof e.providerKey&&(n.providerKey=e.providerKey),"string"==typeof e.logoUrl&&(n.logoUrl=e.logoUrl),"string"==typeof e.customSDK&&(n.customSDK=e.customSDK),"boolean"==typeof e.enableGlobalConsentForAllVendorsAndPurposes&&(n.enableGlobalConsentForAllVendorsAndPurposes=e.enableGlobalConsentForAllVendorsAndPurposes),"boolean"==typeof e.alwaysDisplayActionButtons&&(n.alwaysDisplayActionButtons=e.alwaysDisplayActionButtons),"boolean"==typeof e.enabledTCFAPIErrorLogging&&(n.enabledTCFAPIErrorLogging=e.enabledTCFAPIErrorLogging),"object"===st()(e.regulations)&&(n.regulations=e.regulations,"object"===st()(e.regulations.gdpr)&&e.regulations.gdpr.additionalCountries&&(Array.isArray(e.regulations.gdpr.additionalCountries)?n.regulations.gdpr.additionalCountries=e.regulations.gdpr.additionalCountries:n.regulations.gdpr.additionalCountries=[])),"object"===st()(e.regulation)&&(n.regulation=e.regulation),"string"==typeof e.version&&(n.version=e.version),n.vendors=[],n.purposes=[],n.disabledPurposes=[],Array.isArray(e.disabledPurposes)&&(n.disabledPurposes=e.disabledPurposes),e.customPurposes)for(var r=0,i=e.customPurposes;r<i.length;r++){var o=i[r];/^[A-Za-z0-9-_]+$/.test(o.id)?(o.namespace="custom",this.services.DatabasesService.addPurposesToDatabase([o]),n.purposes.push(o.id)):console.error('Didomi - The purpose id "'.concat(o.id,'" is not valid. Ignoring it. '))}Array.isArray(e.essentialPurposes)&&(n.essentialPurposes=e.essentialPurposes.filter(Boolean).filter((function(e){return"custom"===Object(c.f)(t.services.DatabasesService.getPurpose(e),"namespace","")})));var s=this.services.TCFService.getRestrictions(e);s.length>0&&(n.restrictions=s);var a=Object(c.f)(e,"vendors.iab");if(a&&Array.isArray(a))for(var u=0;u<a.length;u++){var p=a[u],l=this.services.DatabasesService.getVendor(p);l&&-1===n.vendors.indexOf(l.id)&&n.vendors.push(p)}else if(a&&a===Object(a)){if(!0===a.all){var f,d=Object(ft.d)(this.store.getState()).vendors;(f=n.vendors).push.apply(f,k()(d.map((function(e){return e.id}))))}else if(a.include&&Array.isArray(a.include))for(var v=0,h=a.include;v<h.length;v++){var g=h[v],b=this.services.DatabasesService.getVendor(g);b&&-1===n.vendors.indexOf(b.id)&&n.vendors.push(g)}a.exclude&&Array.isArray(a.exclude)&&(n.vendors=n.vendors.filter((function(e){return-1===a.exclude.indexOf(e)})))}var y=Object(c.f)(e,"vendors.didomi");if(y&&Array.isArray(y))for(var m=0;m<y.length;m++){var S=y[m],O=this.services.DatabasesService.getVendor(S);O&&-1===n.vendors.indexOf(O.id)&&n.vendors.push(S)}var C=-1!==Object(c.f)(a,"include",[]).indexOf(N.g.google),w=-1!==Object(c.f)(a,"exclude",[]).indexOf(N.g.google);2!==this.TCFVersion||-1!==n.vendors.indexOf("google")||!Object(c.f)(a,"all")&&!C||w||n.vendors.push("google");var P=function(e){return t.services.DatabasesService.getPurpose(e)},j=this.services.DatabasesService.getVendor("google"),_=Object(c.f)(e,"vendors.custom");if(_&&Array.isArray(_)){for(var I=[],A=0;A<_.length;A++){var T=_[A];Object(N.o)(T)&&(T.purposeIds=j.purposeIds,T.legIntPurposeIds=j.legIntPurposeIds);var E=(T.purposeIds||[]).filter(P),L=(T.legIntPurposeIds||[]).filter(P);-1===n.vendors.indexOf("c:".concat(T.id))&&(E.length>0||L.length>0)&&(I.push(vt(vt({},T),{},{purposeIds:E,legIntPurposeIds:L,id:"c:".concat(T.id),namespace:"custom"})),n.vendors.push("c:".concat(T.id)))}I.length>0&&this.services.DatabasesService.addVendorsToDatabase(I)}var D,x=Object(c.f)(e,"vendors.overrideVendors");if(x)for(var R=0,V=Object.keys(x);R<V.length;R++){var B=V[R];this.services.DatabasesService.updateVendor(B,x[B])}for(var F=0,U=n.vendors;F<U.length;F++){var M=U[F],z=this.services.DatabasesService.getVendor(M);if(z&&z.purposeIds)for(var G=0,q=z.purposeIds;G<q.length;G++){var W=q[G],K=this.services.DatabasesService.getPurpose(W);K&&-1===n.purposes.indexOf(K.id)&&-1===n.disabledPurposes.indexOf(K.id)&&n.purposes.push(K.id)}}if(e.purposes)(D=n.purposes).push.apply(D,k()(e.purposes));0===n.vendors.length&&delete n.vendors,0===n.purposes.length&&delete n.purposes,"boolean"==typeof Object(c.f)(a,"enabled")&&(n.tcfEnabled=Object(c.f)(a,"enabled"));var H=Object(c.f)(e,"vendors.google");H&&H.additionalConsent&&(n.google={additionalConsent:{positive:"string"==typeof H.additionalConsent.positive?H.additionalConsent.positive:null,negative:"string"==typeof H.additionalConsent.negative?H.additionalConsent.negative:null}}),H&&void 0!==H.fullATP&&Object(c.l)(n,"google.fullATP",H.fullATP),"string"==typeof e.country&&(n.publisherCountryCode=e.country),"number"==typeof e.consentDuration&&e.consentDuration>0&&(n.consentDuration=e.consentDuration),"number"==typeof e.deniedConsentDuration&&e.deniedConsentDuration>0&&(n.deniedConsentDuration=e.deniedConsentDuration),e.deploymentId&&(n.deploymentId=e.deploymentId),e.customDomain&&(n.customDomain=e.customDomain),this.actions.setWebsiteConfig(n),this.actions.setIABStacks(this.services.TCFService.getIABStacks(this.getRequiredPurposes("iab"),Object(c.f)(e,"vendors.iab.stacks")))}}},{key:"numberOfDaysHasExceeded",value:function(){var e=this.services.NoticeService.getDaysBeforeShowingAgain(),t=this.services.StorageService.getTokenFromCookies().token;return t=t||{},Object(se.d)(new Date(t.updated||null))>=e}},{key:"determineConsentNoticeStatus",value:function(){this.isRegulationApplied("ccpa")&&this.services.CCPAService.shouldShowNotice()?this.services.NoticeService.show():!this.isRegulationApplied("ccpa")&&this.shouldConsentBeCollected()?(this.services.NoticeService.show(),this.services.PreferencesService.shouldShowWhenConsentIsMissing()&&this.services.PreferencesService.show()):(this.services.NoticeService.hide(),this.services.PreferencesService.hide())}},{key:"shouldConsentBeCollected",value:function(){if(this.services.UserService.isConsentRequired()){var e=this.store.getState();return!!K(e)||!0!==this.services.ConsentService.hasAllConsentStatus(this.getPurposesFromAllLegalBases(),this.getRequiredVendors(),2===this.TCFVersion)&&(!1===Object(G.e)(e)||this.numberOfDaysHasExceeded()||!this.services.ConsentService.hasAnyStatus())}return!1}},{key:"setUserAgreeToAll",value:function(e){var t=this.store.getState(),n=Object(q.g)(t),r=Object(q.q)(t),i=Object(q.t)(t),o=Object(q.w)(t),s=Object(q.v)(t);if(0!==[].concat(k()(r),k()(i)).length&&0!==o.length||0!==n.length){var a=new I.a(this.services.ConsentService.getUserStatus.bind(this.services.ConsentService),this.services.ConsentService.setUserStatus.bind(this.services.ConsentService),e);a.enablePurposes.apply(a,k()(r)),a.enableVendors.apply(a,k()(o)),2===this.TCFVersion&&(a.enableVendorsLegitimateInterests.apply(a,k()(s)),a.enablePurposesLegitimateInterests.apply(a,k()(i))),a.commit(),this.services.NoticeService.hide()}}},{key:"setUserDisagreeToAll",value:function(e){var t=this.store.getState(),n=Object(q.g)(t),r=Object(q.q)(t),i=Object(q.t)(t),o=Object(q.w)(t),s=Object(q.v)(t);if(0!==[].concat(k()(r),k()(i)).length&&0!==o.length||0!==n.length){var a=new I.a(this.services.ConsentService.getUserStatus.bind(this.services.ConsentService),this.services.ConsentService.setUserStatus.bind(this.services.ConsentService),e);a.disablePurposes.apply(a,k()(r)),a.disableVendors.apply(a,k()(o)),2===this.TCFVersion&&(a.disableVendorsLegitimateInterests.apply(a,k()(s)),a.disablePurposesLegitimateInterests.apply(a,k()(i))),a.commit(),this.services.NoticeService.hide()}}},{key:"isUserConsentStatusPartial",value:function(){return!1!==this.services.UserService.isConsentRequired()&&(0!==this.getRequiredVendors().length&&!this.services.ConsentService.hasAllConsentStatus(this.getPurposesFromAllLegalBases(),this.getRequiredVendors(),2===this.TCFVersion))}},{key:"getRequiredVendorIds",value:function(){return Object(c.f)(this.store.getState(),"website.vendors",[])}},{key:"getRequiredVendors",value:function(e){var t=this;return this.getRequiredVendorIds().map((function(e){return t.services.DatabasesService.getVendor(e)})).filter((function(t){return!e||t.namespace===e})).filter((function(e){return"object"===st()(e)}))}},{key:"getRequiredFeatures",value:function(){for(var e=this,t=[],n=this.getRequiredVendors().filter(N.p),r=0;r<n.length;r++){var i=n[r];if(Array.isArray(i.featureIds))for(var o=0,s=i.featureIds;o<s.length;o++){var a=s[o];-1===t.indexOf(a)&&t.push(a)}}return t.map((function(t){return e.services.DatabasesService.getFeature(t)}))}},{key:"getVendorsWithPurposesLegitimateInterests",value:function(){return this.getRequiredVendors().filter((function(e){return e.legIntPurposeIds.length>0})).map((function(e){return e.id}))}},{key:"getRequiredSpecialPurposes",value:function(){for(var e=this,t=[],n=this.getRequiredVendors().filter(N.p),r=0;r<n.length;r++){var i=n[r];if(Array.isArray(i.specialPurposeIds))for(var o=0,s=i.specialPurposeIds;o<s.length;o++){var a=s[o];-1===t.indexOf(a)&&t.push(a)}}return t.map((function(t){return e.services.DatabasesService.getSpecialPurpose(t)}))}},{key:"isPurposeRestrictedForVendor",value:function(e,t,n){return this.services.TCFService.isPurposeRestrictedForVendor(e,t,n,this.getPublisherRestrictions())}},{key:"getRequiredPurposeIds",value:function(){return Object(c.f)(this.store.getState(),"website.purposes",[])}},{key:"getRequiredPurposes",value:function(e){var t=this;return this.getRequiredPurposeIds().map((function(e){return t.services.DatabasesService.getPurpose(e)})).filter((function(t){return!e||t.namespace===e})).filter((function(e){return"object"===st()(e)}))}},{key:"getEssentialPurposes",value:function(){return Object(c.f)(this.store.getState(),"website.essentialPurposes",[])}},{key:"getPurposesBasedOnConsent",value:function(){var e=this.store.getState();return[].concat(k()(Object(q.r)(e)),k()(Object(q.n)(e)))}},{key:"getPurposesBasedOnLegitimateInterest",value:function(){return Object(q.u)(this.store.getState())}},{key:"getPurposesFromAllLegalBases",value:function(){var e=this.getPurposesBasedOnConsent(),t=this.getPurposesBasedOnLegitimateInterest();return 1===this.TCFVersion?e:[].concat(k()(e),k()(t))}},{key:"getAPIKey",value:function(){var e=Object(c.f)(this.store.getState(),"website.apiKey");if(!e){var t=document.getElementById("spcloader");if(t&&t.getAttribute){var n=t.getAttribute("data-key");"string"==typeof n&&n.length>0&&(e=n,this.actions.setAPIKey(e))}}return e}},{key:"getProviderKey",value:function(){var e=Object(c.f)(this.store.getState(),"website.providerKey");if(!e){var t=document.getElementById("spcloader");if(t&&t.getAttribute){var n=t.getAttribute("data-provider");"string"==typeof n&&n.length>0&&(e=n,this.actions.setProviderKey(e))}}return e}},{key:"getCustomSDKKey",value:function(){return Object(c.f)(this.store.getState(),"website.customSDK")}},{key:"getEnableGlobalConsentForAllVendorsAndPurposes",value:function(){return Object(c.f)(this.store.getState(),"website.enableGlobalConsentForAllVendorsAndPurposes")}},{key:"shouldAlwaysDisplayActionButtons",value:function(){return Object(c.f)(this.store.getState(),"website.alwaysDisplayActionButtons")}},{key:"isRegulationEnabled",value:function(e){return!0===Object(c.f)(this.store.getState(),"website.regulations.".concat(e,".enabled"))}},{key:"isRegulationApplied",value:function(e){return this.isRegulationEnabled(e)&&this.services.UserService.isSubjectToRegulation(e)}},{key:"isTCFEnabled",value:function(){return!1!==Object(c.f)(this.store.getState(),"website.tcfEnabled")}},{key:"getOpenDialogsCount",value:function(){return Object(c.f)(this.store.getState(),"website.openDialogsCount")||0}},{key:"incrementOpenDialogsCount",value:function(){this.actions.setOpenDialogsCount(this.getOpenDialogsCount()+1)}},{key:"decrementOpenDialogsCount",value:function(){this.actions.setOpenDialogsCount(this.getOpenDialogsCount()-1)}},{key:"getPublisherRestrictions",value:function(){return Object(c.f)(this.store.getState(),"website.restrictions",[])}},{key:"getApplyingRegulation",value:function(){return this.isRegulationApplied("ccpa")?"ccpa":"gdpr"}}]),n}(m.a),bt=n(47),yt=n(15),mt=function(e){return e.optout.vendors_li.enabled||[]},St=function(e){return e.optout.purposes_li.enabled||[]},Ot=Object(z.a)([St,q.s],(function(e,t){var n=t.filter((function(t){return-1===e.indexOf(t)}));return{enabled:e,disabled:n}})),Ct=Object(z.a)([mt,function(e){return e.optout.vendors_li.disabled||[]},q.v],(function(e,t,n){return Object(yt.a)([].concat(k()(e),k()(t),k()(n)))})),wt=Object(z.a)([St,mt,ft.f,Ct],(function(e,t,n,r){var i=t.filter((function(t){return!!n[t]&&Object(yt.b)(Object(c.g)(n[t].legIntPurposeIds),k()(e))})),o=r.filter((function(e){return-1===i.indexOf(e)}));return{enabled:i,disabled:o}})),Pt=Object(z.a)([St,mt,ft.f,Ct],(function(e,t,n,r){var i=t.filter((function(t){if(n[t]){var r=k()(Object(c.g)(n[t].legIntPurposeIds)),i=k()(e);return Object(yt.b)(r,i)}return!1})),o=r.filter((function(e){return-1===i.indexOf(e)}));return{enabled:i,disabled:o}})),kt=Object(z.a)([function(e){return e.optout},Ot,Pt,wt],(function(e,t,n,r){return{purposes:{legitimate_interest:{enabled:Object(c.f)(e,"purposes_li.enabled"),disabled:Object(c.f)(e,"purposes_li.disabled")},global:t},vendors:{legitimate_interest:{enabled:Object(c.f)(e,"vendors_li.enabled"),disabled:Object(c.f)(e,"vendors_li.disabled")},global:n,global_li:r},user_id:e.user_id,created:e.created,updated:e.updated}}));function jt(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=y()(e);if(t){var i=y()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return g()(this,n)}}var _t=function(e){v()(n,e);var t=jt(n);function n(e,r,i){return p()(this,n),t.call(this,e,r,i)}return f()(n,[{key:"init",value:function(){this.TCFVersion=this.services.TCFService.version}},{key:"getTCFCookieName",value:function(){return 1===this.TCFVersion?"euconsent":Object(Y.g)(this.store.getState())}},{key:"getDidomiCookieName",value:function(){return Object(Y.e)(this.store.getState())}},{key:"getOptoutDidomiCookieName",value:function(){return e=this.store.getState(),(null===(t=e.website.regulation)||void 0===t||null===(n=t.cookies)||void 0===n?void 0:n.didomiTokenCookieName)||"didomi_token_".concat(Object(q.p)(e));var e,t,n}}]),n}(m.a),It=n(21),At=n(40),Tt=function(){function e(t){p()(this,e),this.callbacks={},this.timeoutCalled=!1;var n=document.createElement("iframe");n.setAttribute("src",t),n.setAttribute("id","iframe-cookies-group"),n.setAttribute("style","display:none"),document.body.appendChild(n),this.iframe=n}return f()(e,[{key:"isNotResponding",value:function(){return this.timeoutCalled}},{key:"getType",value:function(){return"group"}},{key:"getTokens",value:function(e,t,n,r,i,o,s,a){var c=this;this.iframe.onload=function(){c.postMessageToIframe("getTokens",{name:e,type:t,storageSources:n,isSameSiteRequired:r,TCFVersion:i,expiry:o},s,a)}}},{key:"setToken",value:function(e,t,n,r,i){this.postMessageToIframe("setToken",{name:e,value:t,storageSources:n,isSameSiteRequired:r,expiry:i})}},{key:"deleteToken",value:function(e){this.postMessageToIframe("deleteToken",{name:e})}},{key:"postMessageToIframe",value:function(e,t,n){var r=this,i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:4e3;if(this.iframe&&!this.isNotResponding()){var o=Object(At.a)(),s=this.getType();this.iframe.contentWindow.postMessage({__didomiCall:{call:e,callId:o,type:s,params:t}},"*"),n&&(this.callbacks[o]=n,setTimeout((function(){r.callbacks[o]&&(r.callbacks[o](new Error("Timeout")),delete r.callbacks[o],r.timeoutCalled=!0)}),i))}}},{key:"receiveMessageFromIframe",value:function(e){if(e&&e.data){var t;try{t="string"==typeof e.data?JSON.parse(e.data):e.data}catch(e){return}if(t.__didomiCall){var n=t.__didomiCall;this.callbacks[n.callId]&&this.getType()===n.type&&(this.callbacks[n.callId](null,n.params),delete this.callbacks[n.callId])}}}}]),e}();function Et(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=y()(e);if(t){var i=y()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return g()(this,n)}}var Lt=function(e){v()(n,e);var t=Et(n);function n(){return p()(this,n),t.apply(this,arguments)}return f()(n,[{key:"init",value:function(){T()(y()(n.prototype),"init",this).call(this),this.group={iframe:null,didomiToken:null,iframeNotResponding:!1,iabConsentString:null,optoutDidomiToken:null},this.callbackCalled=!1,this.iframesCalled=0,this.iframesError=0,this.iframesDisabled=0}},{key:"configure",value:function(e,t){if(e){var n={},r=Object(c.f)(e,"group"),i={};void 0!==r&&r===Object(r)&&(r.customDomain&&"string"==typeof r.customDomain&&(i.customDomain=r.customDomain),r.enabled&&"boolean"==typeof r.enabled&&(i.enabled=r.enabled),n.group=i),this.actions.setThirdPartyCookiesConfig(n),this.storageSources=t}}},{key:"getStorageSources",value:function(){return this.store.getState().cookies.storageSources}},{key:"isSameSiteRequired",value:function(){return this.store.getState().cookies.isSameSiteRequired}},{key:"createIframe",value:function(){var e=this.services.SDKConfigService.get("globalCookiesProtocol"),t=Object(c.f)(this.getConfigCookie(),"customDomain"),n="".concat(e,"://").concat(Object(se.k)(t),"/global-cookies.").concat(Object(se.h)(),".html");return new Tt(n)}},{key:"initThirdParties",value:function(e){var t=this;if(this.isThirdPartyActive()){window.addEventListener?window.addEventListener("message",(function(e){return t.receiveMessageFromIframe(e)}),!1):window.attachEvent("onmessage",(function(e){return t.receiveMessageFromIframe(e)}));var n=this.store.getState();this.group.iframe=this.createIframe(),this.group.iframe.getTokens(this.getDidomiCookieName(),"group",this.storageSources,this.isSameSiteRequired(),this.TCFVersion,Object(q.c)(n),(function(n,r){return t.getTokenFromIframe(n,r,e)}))}else e()}},{key:"receiveMessageFromIframe",value:function(e){this.isThirdPartyActive()&&this.group.iframe.receiveMessageFromIframe(e)}},{key:"getConfigCookie",value:function(){return Object(c.f)(this.store.getState(),"cookies.group")}},{key:"getEnabledCookies",value:function(){return this.isThirdPartyActive()?this.getCookie():null}},{key:"getCookie",value:function(){return{didomiToken:this.group.didomiToken,iabConsentString:this.group.iabConsentString}}},{key:"setEnabledCookies",value:function(e,t){this.isThirdPartyActive()&&this.setCookie(e,t)}},{key:"hasEnabledThirdParties",value:function(){return this.isThirdPartyActive()}},{key:"setCookie",value:function(e,t){var n=this.store.getState(),r=Object(q.c)(n);e&&this.group.iframe.setToken(this.getDidomiCookieName(),e,this.storageSources,this.isSameSiteRequired(),r),t&&this.group.iframe.setToken(this.getTCFCookieName(),t,this.storageSources,this.isSameSiteRequired(),r)}},{key:"hasTriedLoadingAllEnabledThirdParties",value:function(){var e=this.isThirdPartyActive()?1:0;return this.iframesCalled===e+this.iframesError+this.iframesDisabled}},{key:"isEnabled",value:function(){var e=this.store.getState();return Object(c.f)(e,"cookies.group.enabled")||!1}},{key:"isThirdPartyActive",value:function(){return this.getConfigCookie().enabled&&!1!==this.isThirdPartySupported()&&!0!==this.group.iframeNotResponding}},{key:"isThirdPartySupported",value:function(){return"false"!==Object(It.b)("didomi_third_party_cookie",this.storageSources)}},{key:"getTokenFromIframe",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=arguments.length>2?arguments[2]:void 0;if(this.iframesCalled+=1,e&&"Timeout"===e.message)this.iframesError+=1,this.group.iframeNotResponding=!0,!this.callbackCalled&&this.hasTriedLoadingAllEnabledThirdParties()&&(this.callbackCalled=!0,n());else{if(t.didomi_accept_cookie){var r=null;t.iab_consent_string&&(this[t.didomi_type].iabConsentString=t.iab_consent_string),t.didomi_token&&(r=t.didomi_token),this[t.didomi_type].didomiToken=r}else this.iframesDisabled+=1,Object(It.e)("didomi_third_party_cookie",!1,this.services.LocalCookiesService.getCookieDomain(),this.storageSources,!1,!1,Object(q.c)(this.store.getState()));!this.callbackCalled&&this.hasTriedLoadingAllEnabledThirdParties()&&(this.callbackCalled=!0,n())}}},{key:"resetIABToken",value:function(){this.isThirdPartyActive()&&this.group.iframe.deleteToken(this.getTCFCookieName())}}]),n}(_t);function Dt(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=y()(e);if(t){var i=y()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return g()(this,n)}}var xt=function(e){v()(n,e);var t=Dt(n);function n(){return p()(this,n),t.apply(this,arguments)}return f()(n,[{key:"configure",value:function(e,t){if(e){var n={},r=Object(c.f)(e,"local"),i={};void 0!==r&&r===Object(r)&&("string"==typeof r.customDomain&&(i.customDomain=r.customDomain),n.local=i),this.actions.setLocalCookiesConfig(n),this.storageSources=t}}},{key:"isSameSiteRequired",value:function(){return this.store.getState().cookies.isSameSiteRequired}},{key:"getLocalCookies",value:function(){return Object(It.c)(this.getDidomiCookieName(),this.getTCFCookieName(),this.storageSources)}},{key:"setLocalCookies",value:function(e,t){var n=this.getCookieDomain(),r=Object(q.c)(this.store.getState());e&&Object(It.e)(this.getDidomiCookieName(),e,n,this.storageSources,!1,this.isSameSiteRequired(),r),t&&Object(It.e)(this.getTCFCookieName(),t,n,this.storageSources,!1,this.isSameSiteRequired(),r)}},{key:"getCookieDomain",value:function(){return this.store.getState().cookies.local.customDomain}},{key:"resetIABToken",value:function(){Object(It.a)(this.getTCFCookieName(),this.getCookieDomain())}}]),n}(_t),Rt=n(37);function Vt(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=y()(e);if(t){var i=y()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return g()(this,n)}}var Bt=function(e){v()(n,e);var t=Vt(n);function n(){return p()(this,n),t.apply(this,arguments)}return f()(n,[{key:"getInitialState",value:function(){return Object(c.b)(Rt.initialState.consent)}},{key:"getUserConsentToken",value:function(){return Object(c.f)(this.store.getState(),"consent")}},{key:"setConsentToken",value:function(e){var t=this.createConsentByVendorFromToken(e);this.actions.setConsentByVendor(t),this.actions.setConsent(e)}},{key:"setConsentString",value:function(e){this.actions.setConsentString(e)}},{key:"setConsentStringPresentFromStorage",value:function(e){this.actions.setConsentStringPresentFromStorage(e)}},{key:"getConsentString",value:function(){return Object(c.f)(this.store.getState(),"iab.consentString")}},{key:"isVendorEnabled",value:function(e){var t=e.vendor,n=e.enabledPurposes,r=e.essentialPurposes;if(-1===e.enabledVendors.indexOf(t.id))return!1;for(var i=Array.isArray(t.purposeIds)?t.purposeIds.filter((function(e){return-1===r.indexOf(e)})):t.purposeIds,o=0;o<i.length;o++){var s=i[o];if(-1===n.indexOf(s))return!1}return!0}},{key:"createConsentByVendorFromToken",value:function(e){var t=this.services,n=t.HooksService,r=t.WebsiteService,i=t.DatabasesService,o={},s=e.purposes,a=e.vendors,c=e.vendors_li,u=n.get("isVendorEnabled",this.isVendorEnabled),p=r.getEssentialPurposes(),l=Object(G.d)(this.store.getState(),{enabled:Object(yt.a)([].concat(k()(a.enabled),k()(c.enabled))),disabled:Object(yt.a)([].concat(k()(a.disabled),k()(c.disabled)))}),f=l.enabledVendors,d=l.disabledVendors;return[].concat(k()(f),k()(d)).forEach((function(e){var t=i.getVendor(e);o[e]={consentToAllPurposes:!t||u({vendor:t,enabledPurposes:s.enabled,disabledPurposes:s.disabled,essentialPurposes:p,enabledVendors:f,disabledVendors:d})}})),o}}]),n}(m.a);function Ft(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function Ut(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?Ft(Object(n),!0).forEach((function(t){i()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):Ft(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var Mt=function(e,t){var n=t.purposeId,r=t.preferenceId,i=t.channelId,o=t.data,s=void 0===o?{}:o,a=s.enabled,u=s.metadata,p=void 0===u?{}:u,l=s.preferenceValue,f=Object(c.b)(e),d=null,v=null;return n?(Object(c.l)(f,"purposes.".concat(n,".id"),n),n&&r&&null!=l?Object(c.l)(f,"purposes.".concat(n,".values.").concat(r),{value:l}):r?(Object(c.l)(f,"purposes.".concat(n,".preferences.").concat(r,".id"),r),i?(d="purposes.".concat(n,".preferences.").concat(r,".channels.").concat(i),v=i):(d="purposes.".concat(n,".preferences.").concat(r),v=r)):i?(d="purposes.".concat(n,".channels.").concat(i),v=i):(d="purposes.".concat(n),v=n)):i&&(d="channels.".concat(i),v=i),d&&Object(c.l)(f,d,Ut(Ut({id:v},Object(c.f)(e,"".concat(d),{})),{},{metadata:Object(c.d)(Object(c.f)(e,"".concat(d,".metadata"),{}),p),enabled:a})),f};function Nt(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function zt(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?Nt(Object(n),!0).forEach((function(t){i()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):Nt(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var Gt=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t={};return e&&(e.purposes&&Array.isArray(e.purposes)&&(t.purposes={},e.purposes.forEach((function(e){t.purposes[e.id]=zt(zt({},e),{},{preferences:{},channels:{}}),e.channels&&Array.isArray(e.channels)&&e.channels.forEach((function(n){t.purposes[e.id].channels[n.id]=zt({},n)})),e.preferences&&Array.isArray(e.preferences)&&e.preferences.forEach((function(n){t.purposes[e.id].preferences[n.id]=zt(zt({},n),{},{channels:{}}),n.channels&&Array.isArray(n.channels)&&n.channels.forEach((function(r){t.purposes[e.id].preferences[n.id].channels[r.id]=r}))}))}))),e.channels&&Array.isArray(e.channels)&&(t.channels={},e.channels.forEach((function(e){t.channels[e.id]=e})))),t},qt=function(e){return{purposes:Object.keys(e.purposes||{}).map((function(t){var n=e.purposes[t],r=n.preferences,i=n.channels;return zt(zt({},e.purposes[t]),{},{preferences:Object.keys(r||{}).map((function(e){var t=r[e];return zt(zt({},t),{},{channels:Object.keys(t.channels||{}).map((function(e){return zt({},t.channels[e])}))})})),channels:Object.keys(i||{}).map((function(e){return i[e]}))})})),channels:Object.keys(e.channels||{}).map((function(t){return e.channels[t]}))}};function Wt(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function Kt(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?Wt(Object(n),!0).forEach((function(t){i()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):Wt(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function Ht(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=y()(e);if(t){var i=y()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return g()(this,n)}}var Jt=function(e){v()(n,e);var t=Ht(n);function n(){return p()(this,n),t.apply(this,arguments)}return f()(n,[{key:"getRemoteConsentsFromAPI",value:function(){var e=this,t=this.services.UserService.getAuthToken();return new Promise((function(n){t?fe.a.ajax({method:"GET",url:"".concat(e.services.SDKConfigService.get("apiPath"),"/consents/users"),headers:{Authorization:"Bearer ".concat(t),"Content-Type":"application/json"},cors:!0},(function(t,r){var i=null;if(200===t){var o;try{(i=Object(c.f)(JSON.parse(r),"data",[]))[0]&&(i=i[0])}catch(e){}if(i){var s=Gt(Object(c.f)(i,"consents",null));i.consents=s}e.actions.loadRemoteConsents(i),e.actions.setUserAuthenticated(!0),e.actions.setUserId(null===(o=i)||void 0===o?void 0:o.id),e.emit("remoteconsent.authenticated",!0)}else e.actions.setUserAuthenticated(!1),e.emit("remoteconsent.authenticated",!1);e.emit("remoteconsent.loaded"),n(i)})):(e.actions.setUserAuthenticated(!1),e.emit("remoteconsent.loaded"),e.emit("remoteconsent.authenticated",!1),n(null))}))}},{key:"getRemoteConsentEventsFromAPI",value:function(e){var t=this,n=e.cursor,r=e.query,i=this.services.UserService.getAuthToken();return new Promise((function(e){if(i){var o=Kt({},r||{});n&&(o.$cursor=n);var s=Object.keys(o).map((function(e){return"".concat(e,"=").concat(encodeURIComponent(o[e]))})).join("&");fe.a.ajax({method:"GET",url:"".concat(t.services.SDKConfigService.get("apiPath"),"/consents/events").concat(s?"?".concat(s):""),headers:{Authorization:"Bearer ".concat(i),"Content-Type":"application/json"},cors:!0},(function(t,n){var r={};if(200===t){try{r=JSON.parse(n)}catch(e){}e(r)}e(r)}))}else e({data:[]})}))}},{key:"setConsent",value:function(e,t){var n=t.purposeId,r=t.preferenceId,i=t.channelId,o=t.data;return Mt(e,{purposeId:n,preferenceId:r,channelId:i,data:o})}},{key:"getRemoteConsentStatusForAll",value:function(){return Object(c.b)(Object(c.f)(this.store.getState(),"remoteConsents"))}},{key:"getRemoteConsentEventsForAll",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};return this.getRemoteConsentEventsFromAPI(e).then((function(e){var t=e.data.map((function(e){return Kt(Kt({},e),{},{consents:Gt(e.consents)})}));return Kt(Kt({},e),{},{data:t})}))}},{key:"setRemoteConsentStatusForAll",value:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},n=this.services.UserService.getAuthToken();return new Promise((function(r,i){return n?t.consents&&"object"===st()(t.consents)?void fe.a.ajax({method:"POST",url:"".concat(e.services.SDKConfigService.get("apiPath"),"/consents/events"),body:JSON.stringify(t),headers:{Authorization:"Bearer ".concat(n),"Content-Type":"application/json"},cors:!0},(function(t,n){if(201===t){var o={};try{o=JSON.parse(n)}catch(e){}e.actions.setRemoteConsents(Gt(o.consents)),e.refreshRemoteConsentsFromAPI().then((function(){r()}))}else i(new Error("Invalid HTTP response code"))})):(console.error("Didomi - Unable to set the remote consent because the consents is empty"),i(new Error("Unable to set the remote consent because the consents is empty"))):(console.error("Didomi - Unable to set the remote consent because the token is empty"),i(new Error("Unable to set the remote consent because the token is empty")))}))}},{key:"refreshRemoteConsentsFromAPI",value:function(){var e=this;return this.getRemoteConsentsFromAPI().then((function(){e.emit("remoteconsent.changed")}))}},{key:"saveConsentForEntityById",value:function(e,t,n,r,i,o){var s=Object(c.k)(r,["enabled","metadata","preferenceValue"]),a=this.setConsent({},{purposeId:e,preferenceId:t,channelId:n,data:s}),u=qt(a);return this.setRemoteConsentStatusForAll({consents:u,metadata:i,proofs:o})}},{key:"setPendingConsentForEntityById",value:function(e,t,n,r){var i=Object(c.k)(r,["enabled","metadata","preferenceValue"]);this.actions.setPendingConsent({purposeId:e,preferenceId:t,channelId:n,data:i}),this.emit("consent.pendingchanged",{pendingConsents:this.getPendingConsents()})}},{key:"getPendingConsents",value:function(){var e=this.store.getState().pendingConsents;return Object.keys(e).map((function(t){return e[t]}))}},{key:"savePendingConsents",value:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},n={};this.getPendingConsents().forEach((function(t){var r=t.purposeId,i=t.preferenceId,o=t.channelId,s=t.data;n=e.setConsent(n,{purposeId:r,preferenceId:i,channelId:o,data:s})}));var r=qt(n);return this.setRemoteConsentStatusForAll(Kt({consents:r},t)).then((function(){return e.resetPendingConsents()}))}},{key:"resetPendingConsents",value:function(){this.actions.resetPendingConsents(),this.emit("consent.pendingchanged",{pendingConsents:this.getPendingConsents()})}},{key:"isUserAuthenticated",value:function(){return Object(c.f)(this.store.getState(),"isUserAuthenticated")}},{key:"getCallbackURL",value:function(){return Object(c.f)(this.store.getState(),"callbackURL")||null}},{key:"requestAuthenticationURL",value:function(){var e=this,t=document.location,n=t.protocol,r=t.hostname,i=t.pathname,o="".concat(n,"//").concat(r).concat(i),s=this.services.SDKConfigService.get("apiPath"),a=this.services.WebsiteService.getAPIKey();return new Promise((function(t){fe.a.ajax({url:"".concat(s,"/auth/initiate?key=").concat(a,"&privacy_center_url=").concat(o,"&redirect=false")},(function(n,r){if(200===n)try{var i=JSON.parse(r).callback;e.actions.setCallbackURL(i),t(i)}catch(e){console.error("Didomi - ".concat(e.message)),t(!1)}t(!1)}))}))}},{key:"sendMessageLogin",value:function(e){var t=this,n=e.value,r=e.channel,i=e.params;return new Promise((function(e,o){var s=t.getCallbackURL();if(!s){var a="You need to request a callback URL through Didomi.requestAuthenticationURL()";return console.error("Didomi - ".concat(a)),o({error:a})}var c=i?"&".concat(encodeURI(Object.keys(i).map((function(e){return"message_params[".concat(e,"]=").concat(i[e])})).join("&"))):"";fe.a.ajax({method:"GET",url:"".concat(s,"&channel=").concat(r,"&id=").concat(encodeURIComponent(n)).concat(c),cors:!0},(function(t,n){return 200!==t?(console.error("Didomi - An error occurred while trying to send the message"),o({error:n,code:t})):e()}))}))}}]),n}(M);function Qt(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=y()(e);if(t){var i=y()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return g()(this,n)}}var Yt=function(e){v()(n,e);var t=Qt(n);function n(){return p()(this,n),t.apply(this,arguments)}return f()(n,[{key:"configure",value:function(e){if(this.TCFVersion=this.services.TCFService.version,e){var t={};e.storageSources&&(t.storageSources={cookies:!1!==e.storageSources.cookies,localStorage:!1!==e.storageSources.localStorage}),e.didomiTokenCookieName&&("string"==typeof e.didomiTokenCookieName&&e.didomiTokenCookieName.length>0?t.didomiTokenCookieName=e.didomiTokenCookieName:console.error('Didomi - Cookie name "'.concat(e.didomiTokenCookieName,'" is not a valid cookie name. Cookies names must be a valid string.'))),e.iabCookieName&&("string"==typeof e.iabCookieName&&e.iabCookieName.length>0?t.iabCookieName=e.iabCookieName:console.error('Didomi - Cookie name "'.concat(e.iabCookieName,'" is not a valid cookie name. Cookies names must be a valid string.'))),this.actions.setStorageConfig(t),this.services.ThirdPartyCookiesService.configure(e,this.store.getState().cookies.storageSources),this.services.LocalCookiesService.configure(e,this.store.getState().cookies.storageSources)}}},{key:"getStorageSources",value:function(){return this.store.getState().cookies.storageSources}},{key:"areThirdPartyCookiesEnabled",value:function(){return this.services.ThirdPartyCookiesService.isEnabled()}},{key:"initStorages",value:function(e){this.services.ThirdPartyCookiesService.initThirdParties(e)}},{key:"getNewToken",value:function(){var e=this.services.LocalStoreService.getInitialState(),t=Object(se.c)();return e.created=t,e.updated=t,e}},{key:"createNewToken",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,t=this.getNewToken();return e&&Object(c.l)(t,"user_id",e),this.resetIABToken(),this.setTokenToStorages(t),t}},{key:"initStoreFromStorage",value:function(){var e=this.store.getState(),t=this.getTokenFromCookies(),n=t.token,r=this.fixConsentString(t.iabConsentString,n),i=t.didomiTokenCreatedFromIABToken;return H(e,n)?(n=this.reset(n.user_id),i=!1):n&&i?this.setTokenToStorages(n):n?(this.setTokenToLocalStore(n),this.setConsentStringToLocalStore(r)):n=this.createNewToken(),this.syncLocalAndThirdPartyStorage(),{token:n,didomiTokenCreatedFromIABToken:i}}},{key:"fixConsentString",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;if(!e)return e;var n=this.services.TCFService.fixConsentString(e,t);return n!==e?(this.setCookies({iabConsentString:n}),n):e}},{key:"setTokenToStorages",value:function(e){var t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];t&&(e=this.updateToken(e));var n=this.createConsentCookiesFromToken(e);return this.setCookies(n),this.setTokenToLocalStore(e),this.setConsentStringToLocalStore(n.iabConsentString),e}},{key:"flushTokenToStorage",value:function(){var e=this.getTokenFromLocalStore();this.setTokenToStorages(e,!1)}},{key:"updateToken",value:function(e){var t=Object(c.b)(e),n=Object(se.c)();return t.updated=n,2===this.TCFVersion&&(t.created=n),t}},{key:"createConsentCookiesFromToken",value:function(e){var t=Object(c.b)(e),n=null,r=Object(c.f)(t,"vendors.enabled")||[],i=Object(c.f)(t,"vendors.disabled")||[],o=Object(c.f)(t,"vendors_li.enabled")||[],s=Object(c.f)(t,"vendors_li.disabled")||[];if(r.length||i.length||o.length||s.length){var a=this.store.getState();n=this.services.TCFService.tokenToIABConsentString(t,this.services.I18nService.locale,Object(ft.d)(a),Object(ft.g)(a),!0);var u=this.services.TCFService.atpTokenFromDidomiToken(Object(c.b)(t));t=this.services.TCFService.removeATPVendorsFromDidomiToken(t),u&&(t.ac=u)}return{iabConsentString:n,didomiTokenAsBase64:Object(W.e)(t,2===this.TCFVersion?Object.keys(N.c[2]):[])}}},{key:"setCookies",value:function(e){var t=this,n=e.iabConsentString,r=e.didomiTokenAsBase64;return this.services.HooksService.get("setCookies",(function(){t.services.ThirdPartyCookiesService.hasEnabledThirdParties()?(t.services.ThirdPartyCookiesService.setEnabledCookies(r,n),t.services.LocalCookiesService.setLocalCookies(null,n)):t.services.LocalCookiesService.setLocalCookies(r,n)}))()}},{key:"getCookies",value:function(){var e=this;return this.services.HooksService.get("getCookies",(function(){var t=e.services.ThirdPartyCookiesService.getEnabledCookies(),n=e.services.LocalCookiesService.getLocalCookies();return e.setCookiesInLocalStore(t,n),null!==t?t:n}))(this.getNewToken())}},{key:"setCookiesInLocalStore",value:function(e,t){this.actions.setThirdPartyCookiesData(e),this.actions.setLocalCookiesData(t)}},{key:"getTokenFromCookies",value:function(){var e=this.getCookies(),t=null;e.iabConsentString&&((t=this.services.TCFService.decodeIABConsentString(e.iabConsentString,!1===this.services.ThirdPartyCookiesService.hasEnabledThirdParties()))||console.error("Didomi - Failed to decode TCF consent string from cookies: ".concat(e.iabConsentString)));var n=e.didomiToken?Object(W.b)(e.didomiToken):null,r=Object(c.f)(n,"ac"),i={didomiToken:n,iabToken:t,addtlConsent:r?this.services.TCFService.decodeAddtlConsent(r):null},o=this.mergeTokens(i.didomiToken,i.iabToken,i.addtlConsent);return{didomiTokenCreatedFromIABToken:o&&i.iabToken&&!i.didomiToken,token:o,iabConsentString:t?e.iabConsentString:null}}},{key:"mergeTokens",value:function(e,t,n){if(!e&&!t&&!n)return null;var r=Object(c.b)(e)||this.services.LocalStoreService.getInitialState();if(t){var i=this.services.TCFService.getMaxVendorID(t),o=N.c[this.TCFVersion],s=Object.keys(o),a=Object(ft.d)(this.store.getState()).vendors.filter((function(e){return e.id<=i})).map((function(e){return e.id})),u=Object(c.f)(r,"vendors.enabled",[]).filter((function(e){return-1===a.indexOf(e)})),p=Object(c.f)(r,"vendors.disabled",[]).filter((function(e){return-1===a.indexOf(e)})),l=Object(c.f)(r,"vendors_li.enabled",[]).filter((function(e){return-1===a.indexOf(e)})),f=Object(c.f)(r,"vendors_li.disabled",[]).filter((function(e){return-1===a.indexOf(e)})),d=Object(c.f)(r,"purposes.enabled",[]).filter((function(e){return-1===s.indexOf(e)})),v=Object(c.f)(r,"purposes.disabled",[]).filter((function(e){return-1===s.indexOf(e)})),h=Object(c.f)(r,"purposes_li.enabled",[]).filter((function(e){return-1===s.indexOf(e)})),g=Object(c.f)(r,"purposes_li.disabled",[]).filter((function(e){return-1===s.indexOf(e)})),b=this.services.TCFService.getVendorsAndPurposesStatuses(t,a,o),y=b.enabledIABvendors,m=b.disabledIABvendors,S=b.enabledIABpurposes,O=b.disabledIABpurposes,C=b.enabledLIIABvendors,w=b.disabledLIIABvendors,P=b.enabledLIIABpurposes,j=b.disabledLIIABpurposes,_=Object(c.f)(n,"vendors.enabled",[]),I=Object(c.f)(n,"vendors.disabled",[]),A=Object(c.f)(n,"vendors_li.enabled",[]),T=Object(c.f)(n,"vendors_li.disabled",[]);Object(c.l)(r,"vendors.enabled",[].concat(k()(u),k()(y),k()(_))),Object(c.l)(r,"vendors.disabled",[].concat(k()(p),k()(m),k()(I))),Object(c.l)(r,"vendors_li.enabled",[].concat(k()(l),k()(C),k()(A))),Object(c.l)(r,"vendors_li.disabled",[].concat(k()(f),k()(w),k()(T))),Object(c.l)(r,"purposes.enabled",[].concat(k()(d),k()(S))),Object(c.l)(r,"purposes.disabled",[].concat(k()(v),k()(O))),Object(c.l)(r,"purposes_li.enabled",[].concat(k()(h),k()(P))),Object(c.l)(r,"purposes_li.disabled",[].concat(k()(g),k()(j)))}return r}},{key:"getTokenFromLocalStore",value:function(){return this.services.LocalStoreService.getUserConsentToken()}},{key:"setTokenToLocalStore",value:function(e){this.services.LocalStoreService.setConsentToken(e)}},{key:"getConsentStringFromLocalStore",value:function(){return this.services.LocalStoreService.getConsentString()}},{key:"setConsentStringToLocalStore",value:function(e){this.services.LocalStoreService.setConsentString(e)}},{key:"syncLocalAndThirdPartyStorage",value:function(){if(this.services.ThirdPartyCookiesService.hasEnabledThirdParties()){var e=this.store.getState(),t=Object(Y.b)(e);if(t){var n=Object(Y.c)(e);n&&t!==n&&this.services.LocalCookiesService.setLocalCookies(null,n)}}}},{key:"reset",value:function(e){return this.createNewToken(e)}},{key:"resetIABToken",value:function(){var e=this;this.services.HooksService.get("resetCookies",(function(){e.services.LocalCookiesService.resetIABToken(),e.services.ThirdPartyCookiesService.resetIABToken()}))()}}]),n}(m.a);function Zt(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=y()(e);if(t){var i=y()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return g()(this,n)}}var Xt=function(e){v()(n,e);var t=Zt(n);function n(e,r,i){var o;return p()(this,n),(o=t.call(this,e,r,i)).config={},o.loadedConfig=!1,o}return f()(n,[{key:"configure",value:function(e){var t=this;if(!e||"object"!==st()(e))return null;if("object"===st()(e.configByCountry)&&this.services.UserService.getCountry()){var n=e.configByCountry[this.services.UserService.getCountry().toUpperCase()];n&&(e=Object(c.e)(e,n))}if(e.privacyPolicyURL&&Object(c.l)(e,"website.privacyPolicyURL",e.privacyPolicyURL),"object"===st()(e.hooks)&&this.services.HooksService.configure(e.hooks),e.apiPath&&this.services.SDKConfigService.configure(e),e.website||e.app){var r=Object(c.e)(e.website,e.app);e.regulations&&(r.regulations=e.regulations),e.regulation&&(r.regulation=e.regulation),e.version&&(r.version=e.version),this.services.WebsiteService.configure(r)}(this.services.StorageService.configure(e.cookies),"object"===st()(e.user)&&this.services.UserService.configure(e.user),"object"===st()(e.sync)&&this.services.SyncService.configure(e.sync),e.languages&&this.services.I18nService.configure(e.languages),e.notice&&(e.regulation&&"ccpa"===e.regulation.name&&(e.notice.type="optout"),this.services.NoticeService.configure(e.notice)),e.preferences&&this.services.PreferencesService.configure(e.preferences),e.theme&&this.services.ThemeService.configure(e.theme),this.services.TagManagersService.configure("didomi"),e.tagManager)&&Object(c.f)(e,"tagManager.provider","").split("|").filter((function(e){return e&&"didomi"!==e})).forEach((function(n){t.services.TagManagersService.configure(n,e.tagManager)}));return this.services.ComponentsService.configure(e.components),this.services.EventsService.configure(e.events),e.experiment&&this.services.ExperimentsService.configure(e.experiment),e.integrations&&this.services.IntegrationsService.configure(e.integrations),e}},{key:"getConfig",value:function(){if(!this.loadedConfig){if(this.loadedConfig=!0,window.didomiRemoteConfig&&"object"===st()(window.didomiRemoteConfig)){var e=Object(c.f)(window.didomiRemoteConfig,"notices.0");e&&"object"===st()(e)&&e.config&&"object"===st()(e.config)&&Object(c.d)(this.config,e.config)}window.didomiConfig&&"object"===st()(window.didomiConfig)&&Object(c.d)(this.config,window.didomiConfig);var t=this.filterAllowedProperties(this.getURLConfiguration());t&&Object(c.d)(this.config,t)}return this.config}},{key:"getURLConfiguration",value:function(){var e=window.location.href;if(-1!==e.indexOf("didomiConfig")){var t=Object(se.f)(e,"didomiConfig"),n={};return Object.keys(t).sort().forEach((function(e){if("didomiConfig"===e)try{n=JSON.parse(t[e])}catch(t){console.error('Didomi - Invalid JSON from query-string parameter "'.concat(e,'": ').concat(t.message))}else if(-1!==e.indexOf("".concat("didomiConfig","."))&&-1===e.indexOf("__proto__")){var r;try{r=JSON.parse(t[e])}catch(n){r=t[e]}Object(c.l)(n,e.replace("".concat("didomiConfig","."),""),r)}})),n}return null}},{key:"filterAllowedProperties",value:function(e){return["notice.enable","notice.showDataProcessing","experiment.group","app.vendors.iab.version","app.alwaysDisplayActionButtons","user.externalConsent.value","sync.enabled"].reduce((function(t,n){var r=Object(c.f)(e,n);return void 0!==r&&(t=t||{},Object(c.l)(t,n,r)),t}),null)}},{key:"get",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:void 0;return Object(c.f)(this.getConfig(),e)||t}},{key:"set",value:function(e,t){Object(c.l)(this.config,e,t)}}]),n}(m.a);function $t(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=y()(e);if(t){var i=y()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return g()(this,n)}}var en=function(e){v()(n,e);var t=$t(n);function n(e,r,i){var o;return p()(this,n),(o=t.call(this,e,r,i)).hooks={},o}return f()(n,[{key:"configure",value:function(e){e&&"object"===st()(e.functions)&&(this.hooks=e.functions)}},{key:"get",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:void 0;return"function"==typeof this.hooks[e]?this.hooks[e]:t}}]),n}(m.a),tn=n(66),nn=n.n(tn);function rn(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=y()(e);if(t){var i=y()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return g()(this,n)}}var on=["en"],sn=function(e){v()(r,e);var t=rn(r);function r(){return p()(this,r),t.apply(this,arguments)}return f()(r,[{key:"componentWillMount",value:function(){this.hostElement=null,this.loadingPromise=null}},{key:"createHostElement",value:function(){this.hostElement=document.createElement("div"),this.hostElement.id="didomi-host",this.hostElement.setAttribute("data-nosnippet","true"),this.hostElement.setAttribute("aria-hidden","true"),document.body.insertBefore(this.hostElement,document.body.firstChild)}},{key:"load",value:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:function(){};this.loadingPromise||(this.actions.loadingUI(),this.loadingPromise=this.importUI().then((function(){e.actions.loadedUI(),e.emitEventOnceReady(e.loadingPromise)}))),this.loadingPromise.then(t)}},{key:"emitEventOnceReady",value:function(e){var t=this;return new nn.a((function(t){e.then(t)})).then((function(){t.emit("ui.ready")}))}},{key:"isLoading",value:function(){return Object(c.f)(this.store.getState(),"ui.loading")||!1}},{key:"isLoaded",value:function(){return Object(c.f)(this.store.getState(),"ui.loaded")||!1}},{key:"importUI",value:function(){var e=this;return this.importUIModule().then((function(t){(0,t.default)(e.hostElement,e.store,e.services)}))}},{key:"importCCPAModule",value:function(e,t){return t?-1!==on.indexOf(e)?n(108)("./".concat(e,"/")):n.e("ui-ccpa").then(n.bind(null,186)):n.e("ui-ccpa").then(n.bind(null,490))}},{key:"importUIModule",value:function(){var e=this.services.I18nService.getLocale();return"ccpa"===Object(c.f)(this.store.getState(),"ui.module")?this.importCCPAModule(e,Object(q.y)(this.store.getState())):n(109)("./".concat(e,"/"))}},{key:"setModule",value:function(e){this.actions.setUIModule(e)}},{key:"enableSpatialNavigation",value:function(){this.actions.enableSpatialNavigation()}}]),r}(M);function an(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=y()(e);if(t){var i=y()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return g()(this,n)}}var cn=function(e){v()(n,e);var t=an(n);function n(e,r,i){var o;return p()(this,n),(o=t.call(this,e,r,i)).sentMetrics={},o}return f()(n,[{key:"addDimensions",value:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[{key:"unset",value:null}];return t.map((function(t){switch(t.key){case"apiKey":return e.services.WebsiteService.getAPIKey()?{type:t.key,value:e.services.WebsiteService.getAPIKey()}:null;case"functionName":return{type:t.key,value:t.value};default:return null}})).filter((function(e){return e}))}},{key:"send",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null,r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:[],i=arguments.length>4&&void 0!==arguments[4]&&arguments[4];if(-1===Object(c.m)(this.metricTypes).indexOf(e))return console.error("Invalid metric type ".concat(e)),null;if("number"==typeof n){if(Math.random()>n)return null}else n=1;var o={};return o.type=e,o.rate=n,r&&(o.dimensions=r),t&&(o.value=t),!0===i&&"function"==typeof navigator.sendBeacon?navigator.sendBeacon("".concat(this.services.SDKConfigService.get("apiPath"),"/metrics?data_format=json"),JSON.stringify(o)):fe.a.ajax({method:"POST",url:"".concat(this.services.SDKConfigService.get("apiPath"),"/metrics"),body:JSON.stringify(o),headers:{"Content-Type":"application/json"},cors:!0},(function(){})),o}},{key:"sendMonitoringDidomiOnLoad",value:function(){void 0===this.sentMetrics[this.metricTypes.monitoringDidomiOnLoad]&&(this.send(this.metricTypes.monitoringDidomiOnLoad,null,this.services.SDKConfigService.get("metrics").monitoringDidomiOnLoadSampleSize,this.addDimensions([{key:"apiKey"}])),this.sentMetrics[this.metricTypes.monitoringDidomiOnLoad]=!0)}}]),n}(m.a);function un(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=y()(e);if(t){var i=y()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return g()(this,n)}}cn.prototype.metricTypes={monitoringDidomiOnLoad:"monitoring.didomi-on-load"};var pn=function(e){v()(r,e);var t=un(r);function r(e,n,i){var o;return p()(this,r),(o=t.call(this,e,n,i)).componentsList=["didomi-base-checkbox","didomi-base-radio","didomi-block","didomi-button","didomi-card","didomi-cards","didomi-checkbox","didomi-checkboxes","didomi-container","didomi-email-login","didomi-header","didomi-image","didomi-modal","didomi-radio","didomi-radios","didomi-save","didomi-text","didomi-section","didomi-purpose","didomi-preference"],o}return f()(r,[{key:"configure",value:function(e){e||(e={}),Array.from(document.querySelectorAll(this.componentsList.join(", "))).length>0&&(e.helpersEnabled="boolean"!=typeof e.helpersEnabled||e.helpersEnabled,e.componentsEnabled="boolean"!=typeof e.componentsEnabled||e.componentsEnabled),this.actions.setComponentsConfig(e)}},{key:"initComponentsModule",value:function(){var e=this,t=this.services.I18nService.getLocale(),n=this.services.SDKConfigService.get("apiPath"),r=this.services.UserService.getUserId(),i=Promise.resolve();if(Object(c.f)(this.store.getState(),"components.helpersEnabled")){var o=Object(c.f)(this.store.getState(),"components.version");i=this.importComponentsByVersion(o).then((function(i){return(0,i.default)({locale:t,apiBaseURL:n,loadComponents:Object(c.f)(e.store.getState(),"components.componentsEnabled"),userId:r}).then((function(e){s()(window.Didomi,e)}))}))}return i.then((function(){e.emit("components.loaded")}))}},{key:"importComponentsByVersion",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:1;return 1===e?this.importComponentsV1():this.importComponents(e)}},{key:"importComponentsV1",value:function(){return n.e("components").then(n.bind(null,476))}},{key:"importComponents",value:function(e){var t=this.services.SDKConfigService.get("pmpSdkPath");return new Promise((function(n,r){var i=document.createElement("script");i.setAttribute("type","text/javascript"),i.setAttribute("async",!0),i.setAttribute("charset","utf-8"),i.setAttribute("src","".concat(t,"/v").concat(e,"/loader/index.js")),window.Didomi.onPMPSDKLoaded=function(){n({default:window.Didomi.initPMPSDK})},i.onerror=r,document.body.appendChild(i)}))}}]),r}(M),ln=n(36);function fn(e){return!0===e?"Y":"N"}var dn=function(){function e(){p()(this,e),this.initialized=!1,this.uspSignal={ccpaApplies:!1,noticeDisplayed:!1,doNotSell:!1,lspa:!1,string:null}}return f()(e,[{key:"init",value:function(e,t,n,r){this.initialized||(this.initialized=!0,this.setUSPData(e,t,n,r),window.__uspapi=this.handleCommand.bind(this),Object(ln.a)("__uspapiCall","__uspapiReturn",this.handleCommand.bind(this),window.__uspapiBuffer))}},{key:"getUSPData",value:function(){return{version:1,uspString:this.uspSignal.string}}},{key:"handleCommand",value:function(e,t,n){if("function"==typeof n)switch(e){case"getUSPData":n(this.getUSPData(t),!0)}}},{key:"setDoNotSellStatus",value:function(e){this.setUSPData(this.uspSignal.ccpaApplies,this.uspSignal.noticeDisplayed,e,this.uspSignal.lspa)}},{key:"setUSPData",value:function(e,t,n,r){this.uspSignal.ccpaApplies=e,this.uspSignal.noticeDisplayed=t,this.uspSignal.doNotSell=n,this.uspSignal.lspa=r,this.uspSignal.ccpaApplies?this.uspSignal.string="1".concat(fn(this.uspSignal.noticeDisplayed)).concat(fn(this.uspSignal.doNotSell)).concat(fn(this.uspSignal.lspa)):this.uspSignal.string="1---"}}]),e}();function vn(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=y()(e);if(t){var i=y()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return g()(this,n)}}var hn=function(e){v()(n,e);var t=vn(n);function n(e,r,i){var o;return p()(this,n),(o=t.call(this,e,r,i)).USPAPI=new dn,o}return f()(n,[{key:"run",value:function(){this.USPAPI.init(this.services.UserService.isSubjectToRegulation("ccpa"),!0,this.getDoNotSellStatus(),!0===Object(c.f)(this.store.getState(),"website.regulations.ccpa.lspa"))}},{key:"getDoNotSellStatus",value:function(){return!0===this.services.StorageService.getTokenFromLocalStore().dns}},{key:"setDoNotSellStatus",value:function(e){if(this.getDoNotSellStatus()!==e){var t=Object(c.b)(this.services.StorageService.getTokenFromLocalStore());t.dns=e,this.services.StorageService.setTokenToStorages(t),this.USPAPI.setDoNotSellStatus(e),this.services.ConsentService.sendEvents(t,!1,"click")}}},{key:"getDoNotSellNoticeDate",value:function(){return Object(c.f)(this.services.StorageService.getTokenFromLocalStore(),"dnsd")}},{key:"updateDoNotSellNoticeDate",value:function(){var e=Object(c.b)(this.services.StorageService.getTokenFromLocalStore());e.dnsd=(new Date).toISOString(),this.services.StorageService.setTokenToStorages(e)}},{key:"shouldShowNotice",value:function(){return!this.getDoNotSellNoticeDate()}}]),n}(M);var gn=function(e){return e.sync.timeout},bn=Object(z.a)((function(e){return e.sync.frequency}),G.c,(function(e,t){return!t||!e||!!(Math.floor((new Date-t)/1e3)>=e)})),yn=Object(z.a)((function(e){return!0===e.sync.enabled}),J,(function(e){return!0===e.user.isBot}),bn,(function(e,t,n,r){return!0===e&&"string"==typeof t&&t.length>0&&!1===n&&r}));function mn(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function Sn(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?mn(Object(n),!0).forEach((function(t){i()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):mn(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function On(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=y()(e);if(t){var i=y()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return g()(this,n)}}var Cn={organizationUserIdAuthAlgorithm:"organization_user_id_algorithm",organizationUserIdAuthSid:"organization_user_id_sid",organizationUserIdAuthSalt:"organization_user_id_salt",organizationUserIdAuthDigest:"organization_user_id_digest",organizationUserIdExp:"organization_user_id_exp",organizationUserIdIv:"organization_user_id_iv"},wn=function(e){v()(n,e);var t=On(n);function n(e,r,i){return p()(this,n),t.call(this,e,r,i)}return f()(n,[{key:"configure",value:function(e){e&&this.actions.setSyncConfig(e)}},{key:"getAuthorizationParameters",value:function(){for(var e=this.store.getState(),t=Q(e),n={},r=0,i=Object.keys(Cn);r<i.length;r++){var o=i[r];t[o]&&(n[Cn[o]]=t[o])}return n}},{key:"getSyncData",value:function(e){var t=this,n=e.agent,r=e.apiKey,i=e.apiPath,o=e.domain,s=e.organizationUserId,a=e.token,c=e.tcfcs,u=e.tcfv,p=e.timeout,l=e.authParams;return new Promise((function(e){fe.a.ajax({method:"POST",url:"".concat(i,"/sync"),body:JSON.stringify({source:{domain:o,key:r,type:"sdk-web"},user:Sn(Sn({id:a.user_id,organization_user_id:s},l),{},{agent:n,token:{created:a.created,updated:a.updated,purposes:a.purposes,purposes_li:a.purposes_li,vendors:a.vendors,vendors_li:a.vendors_li},tcfcs:c,tcfv:u})}),timeout:p,headers:{"Content-Type":"application/json"},cors:!0},(function(n,r){if(201===n){var i;t.emit("sync.done");try{i=JSON.parse(r)}catch(t){return console.error("Didomi - Error while parsing sync response"),e(null)}if(!1===i.synced){var o=i.user.token.consents;e({purposes:{consent:{enabled:o.purposes.enabled,disabled:o.purposes.disabled},legitimate_interest:{enabled:o.purposes_li.enabled,disabled:o.purposes_li.disabled}},vendors:{consent:{enabled:o.vendors.enabled,disabled:o.vendors.disabled},legitimate_interest:{enabled:o.vendors_li.enabled,disabled:o.vendors_li.disabled}},action:"sync"})}else console.error("Didomi - Error while parsing sync response"),e(null)}else 404===n?(t.emit("sync.done","User does not exist, nothing to sync"),e(null)):(console.error("Didomi - Syncing error: ".concat(r)),t.emit("sync.error",r),e(null))}))}))}},{key:"run",value:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:function(){},n=this.store.getState();if(yn(n)){var r=this.services.WebsiteService.isTCFEnabled();return this.getSyncData({agent:navigator.userAgent,apiPath:this.services.SDKConfigService.get("apiPath"),apiKey:this.services.WebsiteService.getAPIKey(),domain:Object(q.h)(n),organizationUserId:J(n),token:Object(Y.d)(n),tcfcs:r?Object(Y.a)(n):null,tcfv:r?this.services.TCFService.version:null,timeout:gn(n),authParams:this.getAuthorizationParameters()}).then((function(n){n&&e.services.ConsentService.setUserStatus(n),e.actions.setLastSyncDate((new Date).toISOString()),e.services.StorageService.flushTokenToStorage(),t()})).catch((function(){t(new Error("Error while getting sync data"))}))}t()}}]),n}(M);function Pn(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=y()(e);if(t){var i=y()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return g()(this,n)}}var kn=function(e){v()(n,e);var t=Pn(n);function n(){return p()(this,n),t.apply(this,arguments)}return f()(n,[{key:"run",value:function(){var e,t=(e=this.store.getState(),e.consentPopup.categories||[]).find((function(e){return"sell my data"===e.name.en.toLowerCase()}));this.actions.setCCPACategory(t);var n=Object(ft.b)(this.store.getState()).sort((function(e,t){var n,r,i=null===(n=e.name)||void 0===n?void 0:n.toLowerCase(),o=null===(r=t.name)||void 0===r?void 0:r.toLowerCase();return i<o?-1:i>o?1:0}));this.actions.setVendors(n)}}]),n}(m.a);function jn(e){var t=e.getConfig(),n=Object(c.f)(t,"website.".concat("vendors.iab.version"))||Object(c.f)(t,"app.".concat("vendors.iab.version"))||2,r=Object(c.f)(t,"experiment.config.app.vendors.iab.version");return 1===n&&2===r?function(e){if(e){var t=e.size;if(e&&"number"==typeof t&&t>=0&&t<=1){var n,r=Object(We.b)("didomi_exp")||"",i=r.split("|"),o=Ce()(i,2),s=o[0],a=o[1];if(r&&s===e.id?n=a:(n=-1!==window.location.search.indexOf("didomiConfig.experiment.group=test")?"test":-1!==window.location.search.indexOf("didomiConfig.experiment.group=control")?"control":Math.random()<t?"test":"control",Object(We.d)("didomi_exp","".concat(e.id,"|").concat(n))),e.group=n,"test"===n)return 2}}return 1}(t.experiment,e.getConfig()):n}function _n(e){for(var t in e)"function"==typeof e[t].init&&e[t].init()}var In=n(33),An=n.n(In);function Tn(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=y()(e);if(t){var i=y()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return g()(this,n)}}var En=function(e){v()(n,e);var t=Tn(n);function n(){return p()(this,n),t.apply(this,arguments)}return f()(n,[{key:"initStoreFromStorage",value:function(){var e=this.getTokenFromCookies().token;return H(this.store.getState(),e)?e=this.reset(e.user_id):e?this.setTokenToLocalStore(e):e=this.createNewToken(),{token:e}}},{key:"getTokenFromCookies",value:function(){var e=this.getCookies();return{token:e.optoutDidomiToken?JSON.parse(An.a.decode(e.optoutDidomiToken)):null}}},{key:"createNewToken",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,t=this.getNewToken();return e&&Object(c.l)(t,"user_id",e),this.setTokenToStorages(t),t}},{key:"setTokenToStorages",value:function(e){var t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];return t&&(e=this.updateToken(e)),this.setCookies({optoutDidomiTokenAsBase64:An.a.encode(JSON.stringify(e))}),this.setTokenToLocalStore(e),e}},{key:"getTokenFromLocalStore",value:function(){return this.store.getState().optout}},{key:"setTokenToLocalStore",value:function(e){this.actions.setOptout(e)}},{key:"setCookies",value:function(e){var t=this,n=e.optoutDidomiTokenAsBase64;return this.services.HooksService.get("setCookies",(function(){t.services.ThirdPartyCookiesService.hasEnabledThirdParties()?t.services.ThirdPartyCookiesService.setEnabledCookies(n):t.services.LocalCookiesService.setLocalCookies(n)}))()}}]),n}(Yt);function Ln(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=y()(e);if(t){var i=y()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return g()(this,n)}}var Dn=function(e){v()(n,e);var t=Ln(n);function n(){return p()(this,n),t.apply(this,arguments)}return f()(n,[{key:"getInitialState",value:function(){var e=Object(c.b)(Rt.initialState.optout);return e.vendors_li.enabled=Object(q.v)(this.store.getState()),e.purposes_li.enabled=Object(q.s)(this.store.getState()),s()({},e)}}]),n}(Bt);function xn(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=y()(e);if(t){var i=y()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return g()(this,n)}}var Rn=function(e){v()(n,e);var t=xn(n);function n(){return p()(this,n),t.apply(this,arguments)}return f()(n,[{key:"setCookie",value:function(e){var t=Object(q.c)(this.store.getState());e&&this.group.iframe.setToken(this.getOptoutDidomiCookieName(),e,this.storageSources,this.isSameSiteRequired(),t)}},{key:"setEnabledCookies",value:function(e){this.isThirdPartyActive()&&this.setCookie(e)}},{key:"getEnabledCookies",value:function(){return this.isThirdPartyActive()?this.getCookie():null}},{key:"getCookie",value:function(){return{optoutDidomiToken:this.group.optoutDidomiToken}}},{key:"getTokenFromIframe",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=arguments.length>2?arguments[2]:void 0;if(this.iframesCalled+=1,e&&"Timeout"===e.message)this.iframesError+=1,this.group.iframeNotResponding=!0,!this.callbackCalled&&this.hasTriedLoadingAllEnabledThirdParties()&&(this.callbackCalled=!0,n());else{if(t.didomi_accept_cookie){var r=null;t.didomi_token&&(r=t.didomi_token),this[t.didomi_type].optoutDidomiToken=r}else this.iframesDisabled+=1,Object(It.e)("didomi_third_party_cookie",!1,this.services.LocalCookiesService.getCookieDomain(),this.storageSources,!1,!1,Object(q.c)(this.store.getState()));!this.callbackCalled&&this.hasTriedLoadingAllEnabledThirdParties()&&(this.callbackCalled=!0,n())}}}]),n}(Lt);function Vn(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=y()(e);if(t){var i=y()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return g()(this,n)}}var Bn=function(e){v()(n,e);var t=Vn(n);function n(){return p()(this,n),t.apply(this,arguments)}return f()(n,[{key:"getLocalCookies",value:function(){return Object(It.d)(this.getOptoutDidomiCookieName(),this.storageSources)}},{key:"setLocalCookies",value:function(e){var t=this.getCookieDomain(),n=Object(q.c)(this.store.getState());e&&Object(It.e)(this.getOptoutDidomiCookieName(),e,t,this.storageSources,!1,this.isSameSiteRequired(),n)}}]),n}(xt),Fn=n(51);function Un(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=y()(e);if(t){var i=y()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return g()(this,n)}}var Mn=function(e){v()(n,e);var t=Un(n);function n(){return p()(this,n),t.apply(this,arguments)}return f()(n,[{key:"setUserStatus",value:function(e){var t=Object(c.f)(e,"purposes.legitimate_interest.enabled",[]),n=Object(c.f)(e,"purposes.legitimate_interest.disabled",[]),r=Object(c.f)(e,"vendors.legitimate_interest.enabled",[]),i=Object(c.f)(e,"vendors.legitimate_interest.disabled",[]),o=Object(c.f)(e,"created"),s=Object(c.f)(e,"updated"),a=(Object(c.f)(e,"action"),Object(c.f)(e,"dns")),u=this.services.StorageService.getTokenFromLocalStore(),p=Object(c.b)(u);p.vendors_li={enabled:r,disabled:i},p.purposes_li={enabled:t,disabled:n},o&&(p.created=o),s&&(p.updated=s),void 0!==a&&(p.dns=a);var l=!Boolean(o)&&!Boolean(s);Object(c.c)(u,p)&&!K(this.store.getState())||(p=this.services.StorageService.setTokenToStorages(p,l),this.setBrowserCookieState(p.purposes_li.enabled)),this.removeScrollListener(window.scrollListener),this.services.WebsiteService.shouldOptoutConsentBeCollected()||this.services.NoticeService.hide()}},{key:"getUserStatus",value:function(){return Object(c.b)(kt(this.store.getState()))}},{key:"setStateFromToken",value:function(){var e=this,t=this.getUserStatus(),n=t.purposes.legitimate_interest,r=t.vendors.legitimate_interest;n.enabled.forEach((function(t){e.actions.setPurposeState(t,!0)})),n.disabled.forEach((function(t){e.actions.setPurposeState(t,!1)})),r.enabled.forEach((function(t){e.actions.setVendorState(t,!0)})),r.disabled.forEach((function(t){e.actions.setVendorState(t,!1)})),this.actions.setSellMyDataState(this.globalStateFromGranularChoices(n.enabled,n.disabled)),this.actions.setAllPartnersState(this.globalStateFromGranularChoices(r.enabled,r.disabled))}},{key:"globalStateFromGranularChoices",value:function(e,t){if(!(e.length>0&&t.length>0))return e.length>0&&0===t.length||!(0===e.length&&t.length>0)&&void 0}},{key:"saveUserChoices",value:function(){var e=this.store.getState(),t=Object(Fn.c)(e),n=Object(Fn.f)(e),r=new I.a(this.getUserStatus.bind(this),this.setUserStatus.bind(this),"click");Object.keys(t).forEach((function(e){!0===t[e]?r.enablePurposeLegitimateInterest(e):r.disablePurposeLegitimateInterest(e)})),Object.keys(n).forEach((function(e){!0===n[e]?r.enableVendorLegitimateInterests(e):r.disableVendorLegitimateInterests(e)})),r.commit()}},{key:"setUserAgreeToAll",value:function(e){var t=this.store.getState(),n=Object(q.s)(t),r=Object(q.v)(t);if(0!==n.length&&0!==r.length){var i=new I.a(this.getUserStatus.bind(this),this.setUserStatus.bind(this),e);i.enablePurposesLegitimateInterests.apply(i,k()(n)),i.enableVendorsLegitimateInterests.apply(i,k()(r)),i.commit(),this.services.NoticeService.hide()}}},{key:"hasAllOptoutStatus",value:function(e,t){for(var n=[],r=0;r<e.length;r++){var i=e[r];"legitimate_interest"===i.legalBasis&&n.push(this.getLegitimateInterestStatusForPurpose(i.id))}for(var o=0;o<t.length;o++){var s=t[o];Array.isArray(s.legIntPurposeIds)&&s.legIntPurposeIds.length>0&&n.push(this.getLegitimateInterestStatusForVendor(s.id))}return!1===n.some((function(e){return void 0===e}))}},{key:"sendEvents",value:function(e,t){var n=e.purposes_li,r=e.vendors_li,i=e.created,o=e.updated,s=e.dns;"sync"!==t&&this.services.EventsService.sendConsentGiven({purposes_li:n,vendors_li:r,created:i,updated:o,dns:!0===s||void 0,action:"string"==typeof t?t:void 0},"navigate"===t)}}]),n}(ee);function Nn(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=y()(e);if(t){var i=y()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return g()(this,n)}}var zn=function(e){v()(n,e);var t=Nn(n);function n(){return p()(this,n),t.apply(this,arguments)}return f()(n,[{key:"run",value:function(){this.USPAPI.init(this.services.WebsiteService.isRegulationApplied("ccpa"),!0,this.getDoNotSellStatus(),!0===Object(c.f)(this.store.getState(),"website.regulation.ccpa.lspa"))}},{key:"getDoNotSellStatus",value:function(){return this.services.StorageService.getTokenFromLocalStore().dns}}]),n}(hn),Gn=function(e,t,n){e.LocalStoreService=new Dn(t,n,e),e.ThirdPartyCookiesService=new Rn(t,n,e),e.LocalCookiesService=new Bn(t,n,e),e.StorageService=new En(t,n,e),e.ConsentService=new Mn(t,n,e),"ccpa"===e.WebsiteService.getApplyingRegulation()&&(e.CCPAService=new zn(t,n,e),e.CCPAService.run()),e.OptoutService.run()};function qn(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=y()(e);if(t){var i=y()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return g()(this,n)}}var Wn=function(e){v()(n,e);var t=qn(n);function n(){return p()(this,n),t.apply(this,arguments)}return f()(n,[{key:"isRegulationApplied",value:function(e){return Object(q.p)(this.store.getState())===e}},{key:"determineConsentNoticeStatus",value:function(){"optout"===Object(q.o)(this.store.getState())&&this.shouldOptoutConsentBeCollected()?this.services.NoticeService.show():"optin"===Object(q.o)(this.store.getState())&&this.shouldConsentBeCollected()?(this.services.NoticeService.show(),this.services.PreferencesService.shouldShowWhenConsentIsMissing()&&this.services.PreferencesService.show()):(this.services.NoticeService.hide(),this.services.PreferencesService.hide())}},{key:"getApplyingRegulation",value:function(){return Object(q.p)(this.store.getState())}},{key:"getRegulationGroupName",value:function(){return Object(q.o)(this.store.getState())}},{key:"shouldOptoutConsentBeCollected",value:function(){var e=this.store.getState().user||{};return(!e.bots||!1!==e.bots.consentRequired||!e.isBot)&&void 0===this.services.StorageService.getTokenFromLocalStore().dns}}]),n}(gt);function Kn(e){if(!window.didomiOnReady||!0!==window.didomiOnReady.stub){if(Array.isArray(window.didomiOnReady))for(var t=0,n=window.didomiOnReady;t<n.length;t++){var r=n[t];"function"==typeof r&&r(e)}window.didomiOnReady={stub:!0,push:function(){for(var t=arguments.length,n=new Array(t),r=0;r<t;r++)n[r]=arguments[r];for(var i=0;i<n.length;i++){var o=n[i];"function"==typeof o&&o(e)}}}}}function Hn(e,t,n,r,i){t&&n?(!function(e,t,n){var r=document.createElement("script");r.id="spccustom",r.type="text/javascript",r.async=!0,r.src="".concat(e).concat(n,"/").concat(t,".js"),r.charset="utf-8";var i=document.getElementsByTagName("script")[0];i.parentNode.insertBefore(r,i)}(e,t,n),r.resume=function(){i(),delete r.resume},setTimeout((function(){r.resume&&console.error("Didomi - 10 seconds timeout for loading custom SDK has expired")}),1e4)):i()}var Jn=function(){function e(){p()(this,e),this.delayedEvents=[],this.isReady=!1}return f()(e,[{key:"delayUntilReady",value:function(e){var t=this;return function(){for(var n=arguments.length,r=new Array(n),i=0;i<n;i++)r[i]=arguments[i];t.isReady?e.apply(void 0,r):t.delayedEvents.push(e.bind.apply(e,[null].concat(r)))}}},{key:"markAsReady",value:function(){for(var e=0,t=this.delayedEvents;e<t.length;e++){(0,t[e])()}this.delayedEvents=[],this.isReady=!0}}]),e}();function Qn(e,t,n){"object"===st()(n)&&"string"==typeof n.event&&n.event&&"function"==typeof n.listener&&t(n.event,e.delayUntilReady(n.listener))}function Yn(e,t,n,r){if("function"==typeof r){var i=Object(c.f)(e,t);"function"!=typeof i?r(null,!1):r(i.apply(e,Array.isArray(n)?n:void 0),!0)}}function Zn(e){Object(ln.a)("__cmpCall","__cmpReturn",Yn.bind(this,e),window.__cmpBuffer)}var Xn=n(41),$n=function(e){Object(Xn.a)()?Promise.all([n.e("polyfills").then(n.t.bind(null,478,7)),n.e("polyfills").then(n.t.bind(null,479,7)),n.e("polyfills").then(n.t.bind(null,480,7)),n.e("polyfills").then(n.t.bind(null,481,7)),n.e("polyfills").then(n.t.bind(null,482,7)),n.e("polyfills").then(n.t.bind(null,483,7)),n.e("polyfills").then(n.t.bind(null,484,7)),n.e("polyfills").then(n.t.bind(null,485,7)),n.e("polyfills").then(n.t.bind(null,486,7)),n.e("polyfills").then(n.t.bind(null,487,7))]).then(e):e()};function er(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function tr(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?er(Object(n),!0).forEach((function(t){i()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):er(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var nr={},rr={},ir={},or=!1;function sr(e){if(nr.configure(e.SiteConfigService.getConfig()),Object(q.l)(a.c.getState())&&(e.WebsiteService=new Wn(a.c,a.b,e),function(e,t,n){"optout"===e.WebsiteService.getRegulationGroupName()&&Gn(e,t,n)}(e,a.c,a.b)),e.RemoteConsentService.getRemoteConsentsFromAPI().then((function(){e.ComponentsService.initComponentsModule()})),"none"===e.WebsiteService.getApplyingRegulation())return e.TCFService.setupPublicAPIFromLocalStore(),e.IntegrationsService.run(),window.Didomi=nr,e.TagManagersService.run(),Zn(rr),void Kn(nr);e.StorageService.initStorages((function(){var t=e.StorageService.initStoreFromStorage(),n=t.didomiTokenCreatedFromIABToken,r=t.token;(function(e){if(window.didomiOnLoad&&window.didomiOnLoad.length){for(var t=window.didomiOnLoad.length,n=0;n<t;n+=1){var r=window.didomiOnLoad.shift();"function"==typeof r&&r(e)}return!0}return!1})(nr)&&(r=e.StorageService.initStoreFromStorage().token,e.MetricsService.sendMonitoringDidomiOnLoad()),e.UserService.loadExternalConsent(),e.CookiesService.enable();var i=e.ExperimentsService.run(r);i&&nr.configure(i);var o=a.c.getState();e.WebsiteService.isRegulationEnabled("ccpa")&&e.CCPAService.run(),e.TCFService.setupPublicAPIFromLocalStore(),e.UIService.setModule(e.WebsiteService.getApplyingRegulation()),"tv"===e.SiteConfigService.get("mode")&&e.UIService.enableSpatialNavigation(),!0===o.sync.delayNotice?e.SyncService.run((function(){e.WebsiteService.determineConsentNoticeStatus()})):(e.SyncService.run(),e.WebsiteService.determineConsentNoticeStatus()),e.IntegrationsService.run(),or=!0,("popup"!==e.NoticeService.getPosition()||"popup"===e.NoticeService.getPosition()&&!e.WebsiteService.shouldConsentBeCollected())&&e.EventsService.sendPageview(),window.Didomi=nr,e.TagManagersService.run(),Zn(rr),e.UIService.isLoading()?e.UIService.on("ui.ready",(function(){return Kn(nr)})):Kn(nr),n&&e.ConsentService.sendEvents(r,!0)}))}function ar(e){e.UIService.createHostElement(),window.addEventListener("pagehide",(function(){e.EventsService.sendPageview(!0)})),s()(rr,{getConfig:function(){return e.SiteConfigService.getConfig()},getUserConsentStatus:function(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;return e.ConsentService.getUserConsentStatus(t,n)},getUserConsentStatusForPurpose:function(t){return e.ConsentService.getUserConsentStatusByPurpose(t)},getUserConsentStatusForVendor:function(t){return e.ConsentService.getUserConsentStatusForAllPurposesByVendor(t)},getUserStatus:function(){return e.ConsentService.getUserStatus()}}),s()(ir,{CCPA:{getDoNotSellStatus:function(){return e.CCPAService.getDoNotSellStatus()},setDoNotSellStatus:function(t){return e.CCPAService.setDoNotSellStatus(t)}},getUserAuthToken:function(){return e.UserService.getAuthToken()},isRegulationApplied:function(t){return e.WebsiteService.isRegulationApplied(t)},isConsentRequired:function(){return e.UserService.isConsentRequired()},requestAuthenticationURL:function(){return e.RemoteConsentService.requestAuthenticationURL()},sendEmailLogin:function(t,n){return e.RemoteConsentService.sendMessageLogin({value:t,channel:"email",params:n})},sendMessageLogin:function(t){var n=t.value,r=t.channel,i=t.params;return e.RemoteConsentService.sendMessageLogin({value:n,channel:r,params:i})},Purposes:e.ConsentService.Purposes,on:function(t,n){return 0===(t=t.toLowerCase()).indexOf("consent.pendingchanged")||0===t.indexOf("remoteconsent.")?e.RemoteConsentService.on(t,n):0===t.indexOf("consent.")?e.ConsentService.on(t,n):0===t.indexOf("cookies.")?e.CookiesService.on(t,n):0===t.indexOf("integrations.")?e.IntegrationsService.on(t,n):0===t.indexOf("notice.")?e.NoticeService.on(t,n):0===t.indexOf("preferences.")?e.PreferencesService.on(t,n):0===t.indexOf("ui.")?e.UIService.on(t,n):0===t.indexOf("components.")?e.ComponentsService.on(t,n):0===t.indexOf("sync.")?e.SyncService.on(t,n):(console.error('Didomi SDK - Cannot subscribe to unknown event type "'.concat(t,'"')),null)},emit:function(e){0!==(e=e.toLowerCase()).indexOf("consent.")&&0!==e.indexOf("remoteconsent.")&&0!==e.indexOf("cookies.")&&0!==e.indexOf("integrations.")&&0!==e.indexOf("notice.")&&0!==e.indexOf("preferences.")&&0!==e.indexOf("ui.")&&0!==e.indexOf("components.")||console.error("Didomi - You cannot emit those types of events")},getTCFVersion:function(){return e.TCFService.getVersion()},isPurposeRestrictedForVendor:function(t,n,r){return e.WebsiteService.isPurposeRestrictedForVendor(t,n,r)},getUserConsentToken:function(){return e.ConsentService.getUserConsentTokenDeprecated()},getObservableOnUserConsentStatusForVendor:function(t){return e.ConsentService.getObservableOnUserConsentStatusForAllPurposesByVendor(t)},getLegitimateInterestStatusForVendor:function(t){return e.ConsentService.getLegitimateInterestStatusForVendor(t)},getLegitimateInterestStatusForPurpose:function(t){return e.ConsentService.getLegitimateInterestStatusForPurpose(t)},getUserStatusForVendor:function(t){return e.ConsentService.getUserStatusForVendor(t)},getUserStatusForVendorAndLinkedPurposes:function(t){return e.ConsentService.getUserStatusForVendorAndLinkedPurposes(t)},setUserStatus:function(t){return e.ConsentService.setUserStatus(t)},setUserStatusForAll:function(t){var n=t.purposesConsentStatus,r=t.purposesLIStatus,i=t.vendorsConsentStatus,o=t.vendorsLIStatus,s=t.created,a=t.updated,c=t.action;return e.ConsentService.setUserStatusForAll({purposesConsentStatus:n,purposesLIStatus:r,vendorsConsentStatus:i,vendorsLIStatus:o,created:s,updated:a,action:c})},setUserConsentStatus:function(t,n,r){return e.ConsentService.setUserConsentStatusDeprecated(t,n,r)},setUserConsentStatusForAll:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[],n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[],r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:[],i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:[];return e.ConsentService.setUserConsentStatus(t,n,r,i)},setRemoteConsentStatusForAll:function(t){return e.RemoteConsentService.setRemoteConsentStatusForAll(t)},getUserConsentStatusForAll:function(){return e.ConsentService.getUserConsentStatusForAll()},getRemoteConsentStatusForAll:function(){return e.RemoteConsentService.getRemoteConsentStatusForAll()},getRemoteConsentEventsForAll:function(t){return e.RemoteConsentService.getRemoteConsentEventsForAll(t)},refreshRemoteConsentsForAll:function(){return e.RemoteConsentService.refreshRemoteConsentsFromAPI()},getPendingConsents:function(){return e.RemoteConsentService.getPendingConsents()},savePendingConsents:function(t){return e.RemoteConsentService.savePendingConsents(t)},resetPendingConsents:function(){return e.RemoteConsentService.resetPendingConsents()},saveConsentForEntityById:function(t,n,r,i,o,s){return e.RemoteConsentService.saveConsentForEntityById(t,n,r,i,o,s)},setPendingConsentForEntityById:function(t,n,r,i){return e.RemoteConsentService.setPendingConsentForEntityById(t,n,r,i)},openTransaction:function(){return new I.a(e.ConsentService.getUserStatus.bind(e.ConsentService),e.ConsentService.setUserStatus.bind(e.ConsentService))},isUserAuthenticated:function(){return e.RemoteConsentService.isUserAuthenticated()},isTCFEnabled:function(){return e.WebsiteService.isTCFEnabled()},configure:function(t){e.SiteConfigService.configure(t),or&&e.WebsiteService.determineConsentNoticeStatus()},notice:{configure:function(e){a.b.setConsentNoticeConfig(e)},show:function(){e.NoticeService.show()},hide:function(){e.NoticeService.hide()},isVisible:function(){return e.NoticeService.isVisible()},showDataProcessing:function(){return e.NoticeService.showDataProcessing()}},preferences:{hide:function(){e.PreferencesService.hide()},show:function(t){e.PreferencesService.show(t)},isVisible:function(){return e.PreferencesService.isVisible()}},setUserAgreeToAll:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"external";e.WebsiteService.setUserAgreeToAll(t)},setUserDisagreeToAll:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"external";e.WebsiteService.setUserDisagreeToAll(t)},isUserConsentStatusPartial:function(){return e.WebsiteService.isUserConsentStatusPartial()},setConfigParameter:function(t,n){return e.SiteConfigService.set(t,n)},theme:{set:function(e,t){var n=e||t;a.b.setTheme({color:n})}},reset:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;e.StorageService.reset(t)},getRequiredVendorIds:function(){return e.WebsiteService.getRequiredVendorIds()},getRequiredVendors:function(t){return e.WebsiteService.getRequiredVendors(t)},getVendorById:function(t){return e.DatabasesService.getVendor(t)},getVendors:function(){return Object(ft.g)(a.c.getState())},getRequiredPurposeIds:function(){return e.WebsiteService.getRequiredPurposeIds()},getRequiredPurposes:function(t){return e.WebsiteService.getRequiredPurposes(t)},getPurposeById:function(t){return e.DatabasesService.getPurpose(t)},getPurposes:function(){return e.DatabasesService.getPurposes()},getLanguage:function(){return e.I18nService.getLocale()},getPurposesBasedOnConsent:function(){return e.WebsiteService.getPurposesBasedOnConsent()},getPurposesBasedOnLegitimateInterest:function(){return e.WebsiteService.getPurposesBasedOnLegitimateInterest()},getPurposesFromAllLegalBases:function(){return e.WebsiteService.getPurposesFromAllLegalBases()},getCategories:function(){return e.PreferencesService.getCategories()},navigate:function(){console.info("Didomi - Ignoring call to navigate. Ensure that the UI is displayed and that the SDK is ready by wrapping your calls in window.didomiOnReady callbacks")},getTranslationAsHTML:function(){return console.error("Didomi - The UI module needs to be loaded before using the getTranslationAsHTML function"),null},shouldConsentBeCollected:function(){return e.WebsiteService.shouldConsentBeCollected()},getExperiment:function(){return e.ExperimentsService.getCurrentExperiment()},version:"166d8bd5d06f8cfc9dc3559ef2bc012dbfd5134a-2022-09-22T10:23:58.204Z"}),s()(nr,tr(tr({},rr),ir)),function(e){if(!window.didomiEventListeners||!0!==window.didomiEventListeners.stub){var t=new Jn;if(window.didomiOnReady=window.didomiOnReady||[],window.didomiOnReady.push((function(){t.markAsReady()})),Array.isArray(window.didomiEventListeners))for(var n=0,r=window.didomiEventListeners;n<r.length;n++){var i=r[n];Qn(t,e,i)}window.didomiEventListeners={stub:!0,push:function(){for(var n=arguments.length,r=new Array(n),i=0;i<n;i++)r[i]=arguments[i];for(var o=0;o<r.length;o++){var s=r[o];Qn(t,e,s)}}}}}(nr.on),e.UserService.initLocation((function(){Hn(e.SDKConfigService.get("customSDKPath"),e.SiteConfigService.get("website.customSDK")||e.SiteConfigService.get("app.customSDK"),e.SiteConfigService.get("website.apiKey")||e.SiteConfigService.get("app.apiKey"),nr,(function(){sr(e)}))}))}function cr(){var e;(e=window).didomiConfig&&e.didomiConfig.sdkPath&&(n.p=e.didomiConfig.sdkPath),$n((function(){return e=a.c,t=a.b,r=ar,(i={}).SDKConfigService=new O(e,t,i),i.SiteConfigService=new Xt(e,t,i),i.EventsService=new he(e,t,i),i.ThemeService=new w(e,t,i),i.NoticeService=new Fe(e,t,i),i.PreferencesService=new ze(e,t,i),i.DatabasesService=new pe(e,t,i),i.ConsentService=new ee(e,t,i),i.CCPAService=new hn(e,t,i),i.CookiesService=new ne(e,t,i),i.TagManagersService=new it(e,t,i),i.UserService=new lt(e,t,i),i.WebsiteService=new gt(e,t,i),i.ExperimentsService=new ye(e,t,i),i.IntegrationsService=new Ve(e,t,i),i.I18nService=new bt.b(e,t,i),i.ThirdPartyCookiesService=new Lt(e,t,i),i.LocalCookiesService=new xt(e,t,i),i.LocalStoreService=new Bt(e,t,i),i.RemoteConsentService=new Jt(e,t,i),i.StorageService=new Yt(e,t,i),i.HooksService=new en(e,t,i),i.UIService=new sn(e,t,i),i.MetricsService=new cn(e,t,i),i.ComponentsService=new pn(e,t,i),i.SyncService=new wn(e,t,i),i.OptoutService=new kn(e,t,i),2===jn(i.SiteConfigService)?Promise.resolve().then(n.bind(null,140)).then((function(n){var o=n.default;i.TCFService=new o(e,t,i),_n(i),r&&r(i)})):n.e("tcf-service-v1").then(n.bind(null,491)).then((function(n){var o=n.default;i.TCFService=new o(e,t,i),_n(i),r&&r(i)})),i;var e,t,r,i}))}if(document.body)cr();else var ur=setInterval((function(){document.body&&(clearInterval(ur),cr())}),1e3);t.default=nr},function(e,t,n){"use strict";n.r(t),n.d(t,"default",(function(){return le}));var r=n(1),i=n.n(r),o=n(5),s=n.n(o),a=n(3),c=n.n(a),u=n(4),p=n.n(u),l=n(6),f=n.n(l),d=n(7),v=n.n(d),h=n(2),g=n.n(h),b=n(16),y=n(91),m=n(21),S=n(12),O=n(36),C=n(8),w=n(0),P=n(15),k=n(26),j={vendorListVersion:k.v,lastUpdated:k.l,gvlSpecificationVersion:k.gsv,tcfPolicyVersion:k.tpv,purposes:k.p.map((function(e){return{id:e}})),specialPurposes:k.sp.map((function(e){return{id:e}})),features:k.f.map((function(e){return{id:e}})),specialFeatures:k.sf.map((function(e){return{id:e}})),stacks:k.st.map((function(e){return{id:e.i,purposeIds:e.p||[],specialFeatureIds:e.sf||[]}})),vendors:k.s.map((function(e){return{id:e.i,purposeIds:e.p||[],flexiblePurposeIds:e.fp||[],specialPurposeIds:e.sp||[],legIntPurposeIds:e.l||[],featureIds:e.f||[],specialFeatureIds:e.sf||[]}}))};function _(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function I(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?_(Object(n),!0).forEach((function(t){s()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):_(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var A=function(e){var t={};return e.map((function(e){t[e.id]=I(I({},e),{},{name:"",description:"",descriptionLegal:""})})),t},T=n(11),E=n.n(T),L=["all","list"],D=["allow","disallow","req-consent","req-li"],x=Object(w.m)(C.e),R=function(e,t,n,r,o){var s=o.vendors.map((function(e){return e.id})),a=Array.isArray(n)&&n.length>0;if("all"===t)return"allow"===e?[]:s;var c=[];return a?"allow"===e?c.push.apply(c,i()(s.filter((function(e){return-1===n.indexOf(e)})))):c.push.apply(c,i()(n)):r.map((function(t){for(var n=t.start,r=t.end,o=[],a=n;a<=r;a++)o.push(a);"allow"===e?c.push.apply(c,i()(s.filter((function(e){return-1===o.indexOf(e)})))):c.push.apply(c,o)})),c},V=function(e){switch(e){case"allow":case"disallow":return 0;case"req-consent":return 1;case"req-li":return 2}},B=function(e,t){var n=Object(w.f)(e,"vendors.iab.restrictions"),r=[];return Array.isArray(n)&&(r=n.map((function(e){var n=e.id,r=e.purposeId,i=e.vendors,o=e.restrictionType,s=Object(w.f)(i,"type"),a=Object(w.f)(i,"ranges"),c=Object(w.f)(i,"ids");return!!function(e){var t=e.restrictionId,n=e.vendorRestrictionType,r=e.vendorRestrictionRanges,i=e.restrictionType,o=e.restrictionPurposeId,s=e.vendorIds,a=-1!==x.indexOf(o),c=a?C.b[o]:Object(w.f)(C.f,"2.".concat(o));if("string"!=typeof t||0===t.length)return console.error('Didomi - Invalid restriction ID "'.concat(t,'" provided for publisher restrictions')),!1;if(void 0===c)return console.error('Didomi - Invalid purpose ID or special feature ID "'.concat(o,'" provided for publisher restrictions')),!1;if(a){if("all"!==n)return console.error("Didomi - Only vendor restriction type 'all' is valid for special features"),!1;if("disallow"!==i)return console.error("Didomi - Only restriction type 'disallow' is valid for special features"),!1}else{if(void 0===n||-1===L.indexOf(n))return console.error('Didomi - Invalid vendor restriction type "'.concat(n,'" provided for publisher restrictions')),!1;if("list"===n)if(Array.isArray(s)&&0!==s.length){if(!s.every((function(e){return"number"==typeof e})))return console.error("Didomi - Vendor IDs for publisher restrictions should be numerical values"),!1}else{if(!Array.isArray(r)||0===r.length)return console.error("Didomi - Invalid vendor restriction ranges provided for publisher restrictions"),!1;if(!(r.map((function(e){var t=Object.keys(e);return"object"===E()(e)&&-1!==t.indexOf("start")&&-1!==t.indexOf("end")&&e.start<e.end})).filter((function(e){return!0===e})).length===r.length))return console.error("Didomi - Invalid vendor restriction ranges provided for publisher restrictions. Each vendor restriction must contain 'start' and 'end' key"),!1}if("string"!=typeof i||-1===D.indexOf(i))return console.error('Didomi - Invalid restriction type "'.concat(i,'" provided for publisher restrictions')),!1;if("cookies"===o&&("req-consent"===i||"req-li"===i))return console.error("Didomi - Only restriction types 'allow' or 'disallow' are valid for the purpose 'cookies'"),!1}return!0}({restrictionId:n,vendorRestrictionType:s,vendorRestrictionRanges:a,restrictionType:o,restrictionPurposeId:r,vendorIds:c})&&{id:n,purposeId:r,vendors:R(o,s,c,a,t),restrictionType:o,vendorRestrictionType:s}})).filter(Boolean)),r},F=function(e,t,n,r){var i=arguments.length>4&&void 0!==arguments[4]&&arguments[4];return"string"!=typeof e&&(e=i?Object(C.k)(e):Object(C.j)(e,2)),0!==(r=r.filter((function(n){return n.purposeId===e&&-1!==n.vendors.indexOf(t)}))).length&&r.some((function(e){return"disallow"===e.restrictionType||"allow"===e.restrictionType||e.restrictionType===n}))},U=function(e,t,n){var r=[],i="req-consent"===t?"legIntPurposeIds":"purposeIds";if(0===n.length)return[];var o=e.flexiblePurposeIds.filter((function(t){return-1!==e[i].indexOf(t)}));if(o.length>0)for(var s=0;s<o.length;s++){var a=o[s],c=F(a,e.id,"disallow",n),u=F(a,e.id,t,n);!c&&u&&r.push(a)}return r},M=function(e,t,n,r){return t&&function(e,t){var n=t.stacks.map((function(e){return e.id})).sort((function(e,t){return e-t})),r=n[0],i=n[n.length-1];if("object"!==E()(e))return console.error("Didomi - configuration for the IAB stacks should be an object"),!1;if(!e.ids&&!e.auto)return console.error('Didomi - configuration for the IAB stacks should contain either IDs of stacks to use or should be configured with attribute "auto" set to true'),!1;if(!(e.auto||Array.isArray(e.ids)&&0!==e.ids.length))return console.error("Didomi - IDs configuration for the IAB stacks should be a non-empty array"),!1;if(!e.auto&&Array.isArray(e.ids)){if(!e.ids.every((function(e){return parseInt(e)===e})))return console.error("Didomi - Configuration for the IAB stacks IDs should contain only integer values"),!1;if(e.ids.some((function(e){return e<r||e>i})))return console.error("Didomi - The provided IAB stack IDs are invalid"),!1}return!0}(t,n)?t.auto?N(e,r):t.ids:[]},N=function(e){var t=["cookies"],n=e.filter((function(e){return!e.isSpecialFeature&&-1===t.indexOf(e.id)})),r=e.filter((function(e){return e.isSpecialFeature})),i=[];return n.length>0&&i.push(42),r.length>0&&i.push(1),i},z=n(13),G=n(31),q=n.n(G),W=function(e){var t=new b.Vector;return t.set(e),b.Base64Url.encode(b.VendorVectorEncoder.encode(t))},K=function(e){var t=[];return b.VendorVectorEncoder.decode(b.Base64Url.decode(e)).set_.forEach((function(e){return t.push(e)})),t};function H(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function J(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?H(Object(n),!0).forEach((function(t){s()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):H(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var Q=function(e,t){for(var n=!0,r=0,i=t.purposeIds;r<i.length;r++){var o=i[r];n=n&&-1!==e.purposes.enabled.indexOf(o)}for(var s=0,a=t.legIntPurposeIds;s<a.length;s++){var c=a[s];n=n&&-1!==e.purposes_li.enabled.indexOf(c)}if(t.specialFeatureIds)for(var u=0,p=t.specialFeatureIds;u<p.length;u++){var l=p[u];Object(C.k)(l)&&(n=n&&-1!==e.purposes.enabled.indexOf(l))}return n},Y=function(e,t,n){var r=t.negative,i=t.positive,o=-1!==e.vendors.enabled.indexOf("google"),s=-1!==e.vendors_li.enabled.indexOf("google");return o&&s&&n?i||"1~7.12.35.62.66.70.89.93.108.122.144.149.153.162.167.184.196.221.241.253.259.272.311.317.323.326.338.348.350.415.440.448.449.482.486.491.494.495.540.571.574.585.587.588.590.725.733.780.817.839.864.867.932.938.981.986.1031.1033.1051.1092.1097.1126.1127.1170.1171.1186.1201.1204.1205.1211.1215.1230.1232.1236.1248.1276.1290.1301.1313.1344.1364.1365.1415.1419.1428.1449.1451.1509.1558.1564.1570.1577.1591.1651.1669.1712.1716.1720.1721.1725.1733.1753.1765.1799.1810.1834.1842.1870.1878.1889.1896.1911.1922.1929.2012.2072.2078.2079.2109.2177.2202.2253.2290.2299.2316.2357.2373.2526.2531.2571.2572.2575.2628.2663.2677.2776.2778.2779.2985.3033.3052.3154":r||""},Z=function(e,t){return e.length>0&&t?"1~".concat(e.join(".")):""},X=function(e){return e.reduce((function(e,t){return J(J({},e),{},s()({},t.id,Object(w.f)(t,"namespaces.google.id")))}),{})},$=function(e){return e.reduce((function(e,t){return J(J({},e),{},s()({},Object(w.f)(t,"namespaces.google.id"),t.id))}),{})},ee=function(e,t){var n=new Date("2020-08-12");if(t.created<n){var r=e.split(".");if(-1!==r[r.length-1].indexOf("YAAAAA"))return r.splice(0,r.length-1).join("")}return e},te=function(e,t,n){var r=new Date("2020-08-01");if(t.created<r||t.lastUpdated<r){t.lastUpdated>=r?t.created=t.lastUpdated:(t.created=r,t.lastUpdated=r);var i=new b.GVL(n());return t.gvl=i,b.TCString.encode(t)}return e},ne=function(e){return-1!==(null==e?void 0:e.toISOString().indexOf("T00:00:00.000Z"))},re=function(e,t,n,r,i,o){return ne(t.created)&&ne(t.lastUpdated)&&(null==e?void 0:e.length)<=500?e:r(n,i,Object(z.d)(o),Object(z.g)(o),!0)},ie=n(9),oe=n(17),se=n(25),ae=n(14);function ce(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function ue(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?ce(Object(n),!0).forEach((function(t){s()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):ce(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function pe(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=g()(e);if(t){var i=g()(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return v()(this,n)}}var le=function(e){f()(r,e);var t=pe(r);function r(e,n,i){var o;return c()(this,r),(o=t.call(this,e,n,i)).version=2,o.cmpApi=void 0,o.__tcfapi=void 0,o.encodedTCString=void 0,o.tcfApiInitialized=!1,o.iabVendorListWithAppliedRestrictions={},o.defaultConsentString=void 0,o}return p()(r,[{key:"init",value:function(){!0===window.gdprAppliesGlobally&&this.actions.setIgnoreCountry(!0),this.googleVendor=this.services.DatabasesService.getVendor("google")}},{key:"isErrorLoggingEnabled",value:function(){return!0===Object(ie.f)(this.store.getState())}},{key:"getVersion",value:function(){return this.version}},{key:"getConsentData",value:function(){return{consentData:this.isConsentRequired||this.encodedTCString?this.encodedTCString:"",gdprApplies:this.isConsentRequired,hasGlobalScope:!1}}},{key:"setupPublicAPIFromStoredItem",value:function(){var e=this.services.UserService.isConsentRequired(),t=e?m.b(Object(oe.g)(this.store.getState()),this.services.StorageService.getStorageSources()):null;(t||!t&&!e)&&this.setupPublicAPI(e,t)}},{key:"setupPublicAPIFromLocalStore",value:function(){var e,t,n,r,o,s,a,c,u,p,l,f,d=this.services.UserService.isConsentRequired(),v=d?this.services.StorageService.getConsentStringFromLocalStore():null;!v&&d&&(this.defaultConsentString=(e=this.services.WebsiteService.getRequiredVendorIds.bind(this),t=this.services.WebsiteService.getPurposesBasedOnLegitimateInterest.bind(this.services.WebsiteService),n=this.services.StorageService.getTokenFromLocalStore.bind(this),r=this.tokenToIABConsentString.bind(this),o=this.services.I18nService.locale,s=this.store.getState(),p=t().map((function(e){return e.id})),l=e(),f=Object(w.b)(n()),(a=f.purposes_li.enabled).push.apply(a,i()(p)),(c=f.vendors_li.enabled).push.apply(c,i()(l)),(u=f.vendors.disabled).push.apply(u,i()(l)),r(f,o,Object(z.d)(s),Object(z.g)(s),!0)),this.services.StorageService.setConsentStringToLocalStore(this.defaultConsentString),v=this.defaultConsentString),this.setupPublicAPI(d,v)}},{key:"getAdditionalConsentString",value:function(){var e,t,n,r,i,o,s,a,c=this.store.getState();return e=this.googleVendor,t=Object(oe.d)(c),n={negative:Object(ie.j)(c),positive:Object(ie.k)(c)},r=Object(oe.f)(c),i=Object(ie.i)(c),o=n.negative,s=n.positive,a=Q(t,e),i?Z(r,a):Y(t,{negative:o,positive:s},a)}},{key:"setAdditionalConsentString",value:function(){this.services.UserService.isConsentRequired()&&this.actions.setDecodedAdditionalConsent(this.getAdditionalConsentString())}},{key:"appendAdditionalConsentString",value:function(e){return e&&this.googleVendor&&(e.addtlConsent=Object(se.b)(this.store.getState())),e}},{key:"getTCData",value:function(e,t,n){if(t&&t.gdprApplies&&"tcloaded"===t.eventStatus&&t.tcString===this.defaultConsentString){if(null!==t.listenerId)return null;t.eventStatus="cmpuishown"}e(this.appendAdditionalConsentString(t),n)}},{key:"setupPublicAPI",value:function(e,t){var n=this;!this.tcfApiInitialized&&this.services.WebsiteService.isTCFEnabled()&&(this.tcfApiInitialized=!0,this.isConsentRequired=e,this.cmpApi=new y.CmpApi(7,1,!0,{getTCData:this.getTCData.bind(this)}),this.setCmpApiTcModel(!1,t),this.__tcfapi=this.cmpApi.callResponder,window.__tcfapi=function(e,t,r,i){return n.isErrorLoggingEnabled()?n.handleCommand(e,i,Object(ae.a)(r),t,!1):n.handleCommand(e,i,r,t,!1)},e&&(this.services.NoticeService.on("notice.shown",(function(){return n.setCmpApiTcModel(!0,n.services.StorageService.getConsentStringFromLocalStore()||n.defaultConsentString)})),this.services.NoticeService.on("notice.hidden",(function(){return n.setCmpApiTcModel(!1,n.services.StorageService.getConsentStringFromLocalStore()||n.defaultConsentString)})),this.services.ConsentService.on("internal.consent.changed",(function(){n.setCmpApiTcModel(!1,n.services.StorageService.getConsentStringFromLocalStore())}))),Object(O.a)("__tcfapiCall","__tcfapiReturn",this.handleCommand.bind(this),window.__tcfapiBuffer))}},{key:"setCmpApiTcModel",value:function(e,t){return this.cmpApi?(this.setAdditionalConsentString(),this.encodedTCString===t&&this.uiVisible===e?null:(this.uiVisible=e,this.encodedTCString=t,void this.cmpApi.update(t,e))):null}},{key:"handleCommand",value:function(e,t,n,r,i){if("function"==typeof n){if(-1===n.toString().indexOf("postMessage")&&i){var o=t;t=r,r=o}r=this.formatTcfApiCallVersion(r),this.__tcfapi.apiCall(e,r,n,t)}}},{key:"formatTcfApiCallVersion",value:function(e){switch(e){case"null":return null;default:return e}}},{key:"importIABTexts",value:function(){return n.e("iab-texts").then(n.bind(null,477))}},{key:"shouldVendorBeExcluded",value:function(e){return 0===e.purposeIds.length&&0===e.legIntPurposeIds.length&&0===e.specialPurposeIds.length}},{key:"getIABVendorListCore",value:function(e){var t=this;if(!e)return j;if(!Object(w.h)(this.iabVendorListWithAppliedRestrictions))return this.iabVendorListWithAppliedRestrictions;var n=this.services.SiteConfigService.getConfig(),r=this.getRestrictions(Object(w.f)(n,"app")||Object(w.f)(n,"website"),j);return 0===r.length?j:(this.iabVendorListWithAppliedRestrictions=ue(ue({},j),{},{vendors:j.vendors.map((function(e){var n=ue(ue({},e),{},{purposeIds:e.purposeIds.filter((function(n){return!t.isPurposeRestrictedForVendor(n,e.id,"req-li",r,!1)})),legIntPurposeIds:e.legIntPurposeIds.filter((function(n){return!t.isPurposeRestrictedForVendor(n,e.id,"req-consent",r,!1)})),specialFeatureIds:e.specialFeatureIds.filter((function(n){return!t.isPurposeRestrictedForVendor(n,e.id,"disallow",r,!0)}))});return n.purposeIds=Object(P.a)([].concat(i()(n.purposeIds),i()(U(e,"req-consent",r)))),n.legIntPurposeIds=Object(P.a)([].concat(i()(n.legIntPurposeIds),i()(U(e,"req-li",r)))),!t.shouldVendorBeExcluded(n)&&n})).filter(Boolean)}),this.iabVendorListWithAppliedRestrictions)}},{key:"getGVLVendorListData",value:function(){var e,t,n=this.getIABVendorListCore(!1);return{vendorListVersion:n.vendorListVersion,lastUpdated:n.lastUpdated,gvlSpecificationVersion:n.gvlSpecificationVersion,tcfPolicyVersion:n.tcfPolicyVersion,purposes:A(n.purposes),specialPurposes:A(n.specialPurposes),features:A(n.features),specialFeatures:A(n.specialFeatures),stacks:A(n.stacks),vendors:(e=n.vendors,t={},e.map((function(e){t[e.id]={id:e.id,purposes:e.purposeIds,flexiblePurposes:e.flexiblePurposeIds,specialPurposes:e.specialPurposeIds,legIntPurposes:e.legIntPurposeIds,features:e.featureIds,specialFeatures:e.specialFeatureIds,name:"",policyUrl:""}})),t)}}},{key:"tokenToIABConsentString",value:function(e,t,n,r,i){var o=arguments.length>5&&void 0!==arguments[5]?arguments[5]:7,s=this.store.getState(),a=Object(w.f)(e,"purposes.enabled")||[],c=a.filter((function(e){return-1!==C.a.indexOf(e)}))||[],u=Object(w.f)(e,"vendors.enabled")||[],p=Object(w.f)(e,"vendors_li.enabled")||[],l=Object(w.f)(e,"purposes_li.enabled")||[],f=Object(ae.g)(new Date(Object(w.f)(e,"created"))),d=Object(ae.g)(new Date(Object(w.f)(e,"updated"))),v=this.services.WebsiteService.getPublisherRestrictions(),h=Object(ie.m)(s),g=Object(C.h)(a,u,n,r,2),y=g.iabPurposesStatus,m=g.iabVendorsStatus,S=Object(C.h)(l,p,n,r,2),O=S.iabPurposesStatus,P=S.iabVendorsStatus,k=this.getGVLVendorListData(),j=new b.GVL(k),_=new b.TCModel(j);_.vendorListVersion=k.vendorListVersion,_.cmpId=o,_.cmpVersion=1,_.created=f,_.lastUpdated=d,_.consentScreen=1,_.consentLanguage=t,_.isServiceSpecific=!0,h&&(_.publisherCountryCode=h);var I=Object.keys(y).filter((function(e){return!0===y[e]})).map((function(e){return Number(e)})),A=Object.keys(O).filter((function(e){return!0===O[e]})).map((function(e){return Number(e)})),T=Object.keys(m).filter((function(e){return!0===m[e]})).map((function(e){return Number(e)})),E=Object.keys(P).filter((function(e){return!0===P[e]})).map((function(e){return Number(e)}));if(_.purposeConsents.set(I),_.purposeLegitimateInterests.set(A),_.vendorConsents.set(T),_.vendorLegitimateInterests.set(E),_.publisherConsents.set(I),_.publisherLegitimateInterests.set(A),_.specialFeatureOptins.set(c.map((function(e){return C.b[e]}))),v.length>0)for(var L=0;L<v.length;L++){var D=v[L],x=new b.PurposeRestriction;if(x.purposeId=Object(C.l)(D.purposeId,this.version),void 0!==x.purposeId)if(x.restrictionType=V(D.restrictionType),"all"===D.vendorRestrictionType)_.publisherRestrictions.restrictPurposeToLegalBasis(x);else for(var R=0,B=D.vendors;R<B.length;R++){var F=B[R];_.publisherRestrictions.add(F,x)}}return i?b.TCString.encode(_):_}},{key:"decodeIABConsentString",value:function(e,t){try{var n=b.TCString.decode(e);return t&&7!==n.cmpId?null:n}catch(e){return null}}},{key:"getMaxVendorID",value:function(){var e=Object.keys(this.getGVLVendorListData().vendors).map((function(e){return parseInt(e)}));return Math.max.apply(Math,i()(e))}},{key:"getVendorsAndPurposesStatuses",value:function(e,t,n){var r=e.vendorConsents,i=e.vendorLegitimateInterests,o=e.purposeConsents,s=e.purposeLegitimateInterests,a=[];r.set_.forEach((function(e){e!==C.g.google&&a.push(e)}));var c=t.filter((function(e){return-1===a.indexOf(e)})),u=[];o.set_.forEach((function(e){return u.push(e)}));var p=u.map((function(e){return Object(C.j)(e,2)})),l=Object.keys(n).filter((function(e){return-1===p.indexOf(e)})),f=[];i.set_.forEach((function(e){e!==C.g.google&&f.push(e)}));var d=t.filter((function(e){return-1===f.indexOf(e)})),v=[];s.set_.forEach((function(e){return v.push(e)}));var h=v.map((function(e){return Object(C.j)(e,2)})),g=Object.keys(n).filter((function(e){return-1===h.indexOf(e)}));return{enabledIABvendors:a,disabledIABvendors:c,enabledIABpurposes:p,disabledIABpurposes:l,enabledLIIABvendors:f,disabledLIIABvendors:d,enabledLIIABpurposes:h,disabledLIIABpurposes:g}}},{key:"getRestrictions",value:function(e){return B(e,j)}},{key:"isPurposeRestrictedForVendor",value:function(e,t,n,r,i){return F(e,t,n,r,i)}},{key:"getIABStacks",value:function(e,t){return M(e,t||{auto:!0},j,this.version)}},{key:"fixConsentString",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,n=b.TCString.decode(e);return e=te(e,n,this.getGVLVendorListData.bind(this)),t&&(e=re(e,n,t,this.tokenToIABConsentString.bind(this),this.services.I18nService.locale,this.store.getState())),ee(e,n)}},{key:"atpTokenFromDidomiToken",value:function(e){return function(e,t){if(0===t.length)return null;var n=t.map((function(e){return e.id})),r=X(t),i=e.vendors.enabled.filter((function(e){return-1!==n.indexOf(e)})).map((function(e){return r[e]})),o=e.vendors_li.enabled.filter((function(e){return-1!==n.indexOf(e)})).map((function(e){return r[e]}));return"".concat(W(i),".").concat(W(o))}(e,Object(oe.h)(this.store.getState()))}},{key:"removeATPVendorsFromDidomiToken",value:function(e){var t=Object(z.a)(this.store.getState()).map((function(e){return e.id})),n=function(e){return-1===t.indexOf(e)};return ue(ue({},e),{},{vendors:{enabled:e.vendors.enabled.filter(n),disabled:e.vendors.disabled.filter(n)},vendors_li:{enabled:e.vendors_li.enabled.filter(n),disabled:e.vendors_li.disabled.filter(n)}})}},{key:"decodeAddtlConsent",value:function(e){return e?function(e,t){var n=e.split("."),r=q()(n,2),i=r[0],o=r[1],s=$(t),a=K(i).map((function(e){return s[e]})),c=K(o).map((function(e){return s[e]})),u=t.map((function(e){return e.id}));return{vendors:{enabled:a,disabled:u.filter((function(e){return-1===a.indexOf(e)}))},vendors_li:{enabled:c,disabled:u.filter((function(e){return-1===c.indexOf(e)}))}}}(e,Object(z.a)(this.store.getState())):null}}]),r}(S.a)}]).default;
},{}],22:[function(require,module,exports){
function generateMappingString(mapping) {
  return '[' + [
      mapping.map(function(prop) {
          return [
              '{' +
              '&quot;jsmap&quot;:' + prop.jsmap,
              '&quot;map&quot;:' + '&quot;' + prop.map + '&quot;',
              '&quot;maptype&quot;:' + '&quot;' + prop.maptype + '&quot;',
              '&quot;value&quot;:' + '&quot;' + prop.value + '&quot;'+ '}'
          ].join(',');
      }).join(',')
  ].join() + ']';
}

module.exports = {
  generateMappingString,
};

},{}],23:[function(require,module,exports){
const { generateMappingString } = require('./mappings.utils');

var mapping = [
  {
      jsmap: null,
      map: 'mparticle_purpose1',
      maptype: 'something',
      value: 'didomi_purpose1',
  },
  {
      jsmap: null,
      map: 'mparticle_purpose2',
      maptype: 'something',
      value: 'didomi_purpose2',
  },
  {
      jsmap: null,
      map: 'mparticle_purpose3',
      maptype: 'something',
      value: 'didomilt_purpose1',
  },
  {
      jsmap: null,
      map: 'mparticle_purpose4',
      maptype: 'something',
      value: 'didomilt_purpose2',
  },
];

var SDKsettings = {
  apiKey: 'testAPIKey',
  /* fill in SDKsettings with any particular settings or options your sdk requires in order to
  initialize, this may be apiKey, projectId, primaryCustomerType, etc. These are passed
  into the src/initialization.js file as the
  */
  clientKey: '123456',
  appId: 'abcde',
  userIdField: 'customerId',
  purposes: generateMappingString(mapping),
};

// Do not edit below:
module.exports = SDKsettings;

},{"./mappings.utils":22}],24:[function(require,module,exports){
/* eslint-disable no-undef*/

/*
 * Mock XMLHttpRequest (see http://www.w3.org/TR/XMLHttpRequest)
 *
 * Written by Philipp von Weitershausen <philipp@weitershausen.de>
 * Released under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * For test interaction it exposes the following attributes:
 *
 * - method, url, urlParts, async, user, password
 * - requestText
 *
 * as well as the following methods:
 *
 * - getRequestHeader(header)
 * - setResponseHeader(header, value)
 * - receive(status, data)
 * - err(exception)
 * - authenticate(user, password)
 *
 */
function MockHttpRequest () {
    // These are internal flags and data structures
    this.error = false;
    this.sent = false;
    this.requestHeaders = {};
    this.responseHeaders = {};
}
MockHttpRequest.prototype = {
    withCredentials: true,

    statusReasons: {
        100: 'Continue',
        101: 'Switching Protocols',
        102: 'Processing',
        200: 'OK',
        201: 'Created',
        202: 'Accepted',
        203: 'Non-Authoritative Information',
        204: 'No Content',
        205: 'Reset Content',
        206: 'Partial Content',
        207: 'Multi-Status',
        300: 'Multiple Choices',
        301: 'Moved Permanently',
        302: 'Moved Temporarily',
        303: 'See Other',
        304: 'Not Modified',
        305: 'Use Proxy',
        307: 'Temporary Redirect',
        400: 'Bad Request',
        401: 'Unauthorized',
        402: 'Payment Required',
        403: 'Forbidden',
        404: 'Not Found',
        405: 'Method Not Allowed',
        406: 'Not Acceptable',
        407: 'Proxy Authentication Required',
        408: 'Request Time-out',
        409: 'Conflict',
        410: 'Gone',
        411: 'Length Required',
        412: 'Precondition Failed',
        413: 'Request Entity Too Large',
        414: 'Request-URI Too Large',
        415: 'Unsupported Media Type',
        416: 'Requested range not satisfiable',
        417: 'Expectation Failed',
        422: 'Unprocessable Entity',
        423: 'Locked',
        424: 'Failed Dependency',
        500: 'Internal Server Error',
        501: 'Not Implemented',
        502: 'Bad Gateway',
        503: 'Service Unavailable',
        504: 'Gateway Time-out',
        505: 'HTTP Version not supported',
        507: 'Insufficient Storage'
    },

    /*** State ***/

    UNSENT: 0,
    OPENED: 1,
    HEADERS_RECEIVED: 2,
    LOADING: 3,
    DONE: 4,
    readyState: 0,


    /*** Request ***/

    open: function (method, url, async, user, password) {
        if (typeof method !== 'string') {
            throw 'INVALID_METHOD';
        }
        switch (method.toUpperCase()) {
            case 'CONNECT':
            case 'TRACE':
            case 'TRACK':
                throw 'SECURITY_ERR';

            case 'DELETE':
            case 'GET':
            case 'HEAD':
            case 'OPTIONS':
            case 'POST':
            case 'PUT':
                method = method.toUpperCase();
        }
        this.method = method;

        if (typeof url !== 'string') {
            throw 'INVALID_URL';
        }
        this.url = url;
        this.urlParts = this.parseUri(url);

        if (async === undefined) {
            async = true;
        }
        this.async = async;
        this.user = user;
        this.password = password;

        this.readyState = this.OPENED;
        this.onreadystatechange();
    },

    setRequestHeader: function (header, value) {
        header = header.toLowerCase();

        switch (header) {
            case 'accept-charset':
            case 'accept-encoding':
            case 'connection':
            case 'content-length':
            case 'cookie':
            case 'cookie2':
            case 'content-transfer-encoding':
            case 'date':
            case 'expect':
            case 'host':
            case 'keep-alive':
            case 'referer':
            case 'te':
            case 'trailer':
            case 'transfer-encoding':
            case 'upgrade':
            case 'user-agent':
            case 'via':
                return;
        }
        if ((header.substr(0, 6) === 'proxy-')
            || (header.substr(0, 4) === 'sec-')) {
            return;
        }

        // it's the first call on this header field
        if (this.requestHeaders[header] === undefined)
            {this.requestHeaders[header] = value;}
        else {
            var prev = this.requestHeaders[header];
            this.requestHeaders[header] = prev + ', ' + value;
        }

    },

    send: function (data) {
        if ((this.readyState !== this.OPENED)
            || this.sent) {
            throw 'INVALID_STATE_ERR';
        }
        if ((this.method === 'GET') || (this.method === 'HEAD')) {
            data = null;
        }

        //TODO set Content-Type header?
        this.error = false;
        this.sent = true;
        this.onreadystatechange();

        // fake send
        this.requestText = data;
        this.onsend();
    },

    abort: function () {
        this.responseText = null;
        this.error = true;
        for (var header in this.requestHeaders) {
            delete this.requestHeaders[header];
        }
        delete this.requestText;
        this.onreadystatechange();
        this.onabort();
        this.readyState = this.UNSENT;
    },


    /*** Response ***/

    status: 0,
    statusText: '',

    getResponseHeader: function (header) {
        if ((this.readyState === this.UNSENT)
            || (this.readyState === this.OPENED)
            || this.error) {
            return null;
        }
        return this.responseHeaders[header.toLowerCase()];
    },

    getAllResponseHeaders: function () {
        var r = '';
        for (var header in this.responseHeaders) {
            if ((header === 'set-cookie') || (header === 'set-cookie2')) {
                continue;
            }
            //TODO title case header
            r += header + ': ' + this.responseHeaders[header] + '\r\n';
        }
        return r;
    },

    responseText: '',
    responseXML: undefined, //TODO


    /*** See http://www.w3.org/TR/progress-events/ ***/

    onload: function () {
        // Instances should override this.
    },

    onprogress: function () {
        // Instances should override this.
    },

    onerror: function () {
        // Instances should override this.
    },

    onabort: function () {
        // Instances should override this.
    },

    onreadystatechange: function () {
        // Instances should override this.
    },


    /*** Properties and methods for test interaction ***/

    onsend: function () {
        // Instances should override this.
    },

    getRequestHeader: function (header) {
        return this.requestHeaders[header.toLowerCase()];
    },

    setResponseHeader: function (header, value) {
        this.responseHeaders[header.toLowerCase()] = value;
    },

    makeXMLResponse: function (data) {
        var xmlDoc;
        // according to specs from point 3.7.5:
        // "1. If the response entity body is null terminate these steps
        //     and return null.
        //  2. If final MIME type is not null, text/xml, application/xml,
        //     and does not end in +xml terminate these steps and return null.
        var mimetype = this.getResponseHeader('Content-Type');
        mimetype = mimetype && mimetype.split(';', 1)[0];
        if ((mimetype == null) || (mimetype == 'text/xml') ||
           (mimetype == 'application/xml') ||
           (mimetype && mimetype.substring(mimetype.length - 4) == '+xml')) {
            // Attempt to produce an xml response
            // and it will fail if not a good xml
            try {
                if (window.DOMParser) {
                    var parser = new DOMParser();
                    xmlDoc = parser.parseFromString(data, 'text/xml');
                } else { // Internet Explorer
                    xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
                    xmlDoc.async = 'false';
                    xmlDoc.loadXML(data);
                }
            } catch (e) {
                // according to specs from point 3.7.5:
                // "3. Let document be a cookie-free Document object that
                // represents the result of parsing the response entity body
                // into a document tree following the rules from the XML
                //  specifications. If this fails (unsupported character
                // encoding, namespace well-formedness error etc.), terminate
                // these steps return null."
                xmlDoc = null;
            }
            // parse errors also yield a null.
            if ((xmlDoc && xmlDoc.parseError && xmlDoc.parseError.errorCode != 0)
                || (xmlDoc && xmlDoc.documentElement && xmlDoc.documentElement.nodeName == 'parsererror')
                || (xmlDoc && xmlDoc.documentElement && xmlDoc.documentElement.nodeName == 'html'
                    && xmlDoc.documentElement.firstChild && xmlDoc.documentElement.firstChild.nodeName == 'body'
                    && xmlDoc.documentElement.firstChild.firstChild && xmlDoc.documentElement.firstChild.firstChild.nodeName == 'parsererror')) {
                xmlDoc = null;
            }
        } else {
            // mimetype is specified, but not xml-ish
            xmlDoc = null;
        }
        return xmlDoc;
    },

    // Call this to simulate a server response
    receive: function (status, data) {
        if ((this.readyState !== this.OPENED) || (!this.sent)) {
            // Can't respond to unopened request.
            throw 'INVALID_STATE_ERR';
        }

        this.status = status;
        this.statusText = status + ' ' + this.statusReasons[status];
        this.readyState = this.HEADERS_RECEIVED;
        this.onprogress();
        this.onreadystatechange();

        this.responseText = data;
        this.responseXML = this.makeXMLResponse(data);

        this.readyState = this.LOADING;
        this.onprogress();
        this.onreadystatechange();

        this.readyState = this.DONE;
        this.onreadystatechange();
        this.onprogress();
        this.onload();
    },

    // Call this to simulate a request error (e.g. NETWORK_ERR)
    err: function (exception) {
        if ((this.readyState !== this.OPENED) || (!this.sent)) {
            // Can't respond to unopened request.
            throw 'INVALID_STATE_ERR';
        }

        this.responseText = null;
        this.error = true;
        for (var header in this.requestHeaders) {
            delete this.requestHeaders[header];
        }
        this.readyState = this.DONE;
        if (!this.async) {
            throw exception;
        }
        this.onreadystatechange();
        this.onerror();
    },

    // Convenience method to verify HTTP credentials
    authenticate: function (user, password) {
        if (this.user) {
            return (user === this.user) && (password === this.password);
        }

        if (this.urlParts.user) {
            return ((user === this.urlParts.user)
                    && (password === this.urlParts.password));
        }

        // Basic auth.  Requires existence of the 'atob' function.
        var auth = this.getRequestHeader('Authorization');
        if (auth === undefined) {
            return false;
        }
        if (auth.substr(0, 6) !== 'Basic ') {
            return false;
        }
        if (typeof atob !== 'function') {
            return false;
        }
        auth = atob(auth.substr(6));
        var pieces = auth.split(':');
        var requser = pieces.shift();
        var reqpass = pieces.join(':');
        return (user === requser) && (password === reqpass);
    },

    // Parse RFC 3986 compliant URIs.
    // Based on parseUri by Steven Levithan <stevenlevithan.com>
    // See http://blog.stevenlevithan.com/archives/parseuri
    parseUri: function (str) {
        var pattern = /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/;
        var key = ['source', 'protocol', 'authority', 'userInfo', 'user',
            'password', 'host', 'port', 'relative', 'path',
            'directory', 'file', 'query', 'anchor'];
        var querypattern = /(?:^|&)([^&=]*)=?([^&]*)/g;

        var match = pattern.exec(str);
        var uri = {};
        var i = 14;
        while (i--) {
            uri[key[i]] = match[i] || '';
        }

        uri.queryKey = {};
        uri[key[12]].replace(querypattern, function ($0, $1, $2) {
            if ($1) {
                uri.queryKey[$1] = $2;
            }
        });

        return uri;
    }
};


/*
 * A small mock "server" that intercepts XMLHttpRequest calls and
 * diverts them to your handler.
 *
 * Usage:
 *
 * 1. Initialize with either
 *       var server = new MockHttpServer(your_request_handler);
 *    or
 *       var server = new MockHttpServer();
 *       server.handle = function (request) { ... };
 *
 * 2. Call server.start() to start intercepting all XMLHttpRequests.
 *
 * 3. Do your tests.
 *
 * 4. Call server.stop() to tear down.
 *
 * 5. Profit!
 */
function MockHttpServer (handler) {
    if (handler) {
        this.handle = handler;
    }
}
MockHttpServer.prototype = {
    requests: [],
    start: function () {
        var self = this;

        function Request () {
            this.onsend = function () {
                self.requests.push(this);
                self.handle(this);
            };
            MockHttpRequest.apply(this, arguments);
        }
        Request.prototype = MockHttpRequest.prototype;

        window.OriginalHttpRequest = window.XMLHttpRequest;
        window.XMLHttpRequest = Request;
    },

    stop: function () {
        window.XMLHttpRequest = window.OriginalHttpRequest;
    },

    handle: function () {
        // Instances should override this.
    }
};
window.MockHttpServer = MockHttpServer;

},{}],25:[function(require,module,exports){
var SDKsettings = require('./end-to-end-testapp/settings');

describe('Didomi Forwarder', function() {
    var currentUser = null;
    var MessageType = {
        SessionStart: 1,
        SessionEnd: 2,
        PageView: 3,
        PageEvent: 4,
        CrashReport: 5,
        OptOut: 6,
        AppStateTransition: 10,
        Profile: 14,
        Commerce: 16
    },
    EventType = {
        Unknown: 0,
        Navigation: 1,
        Location: 2,
        Search: 3,
        Transaction: 4,
        UserContent: 5,
        UserPreference: 6,
        Social: 7,
        Other: 8,
        Media: 9,
        getName: function() {
            return 'blahblah';
        }
    },
    ProductActionType = {
        Unknown: 0,
        AddToCart: 1,
        RemoveFromCart: 2,
        Checkout: 3,
        CheckoutOption: 4,
        Click: 5,
        ViewDetail: 6,
        Purchase: 7,
        Refund: 8,
        AddToWishlist: 9,
        RemoveFromWishlist: 10
    },
    IdentityType = {
        Other: 0,
        CustomerId: 1,
        Facebook: 2,
        Twitter: 3,
        Google: 4,
        Microsoft: 5,
        Yahoo: 6,
        Email: 7,
        Alias: 8,
        FacebookCustomAudienceId: 9,
    },
    ReportingService = function () {
        var self = this;

        this.id = null;
        this.event = null;

        this.cb = function (forwarder, event) {
            self.id = forwarder.id;
            self.event = event;
        };

        this.reset = function () {
            this.id = null;
            this.event = null;
        };
    },
    reportService = new ReportingService();

    // -------------------DO NOT EDIT ANYTHING ABOVE THIS LINE-----------------------
    // -------------------START EDITING BELOW:-----------------------
    // -------------------mParticle stubs - Add any additional stubbing to our methods as needed-----------------------
    mParticle.Identity = {
        getCurrentUser: function() {
            if (!currentUser) {
                currentUser = {
                    consentState: null,
                    getUserIdentities: function() {
                        return {
                            userIdentities: {
                                customerid: '123'
                            }
                        };
                    },
                    getMPID: function() {
                        return '123';
                    },
                    getConsentState: function () {
                        return this.consentState;
                    },
                    setConsentState: function (consentState) {
                        this.consentState = consentState;
                    },
                    setUserAttribute: function() {
        
                    },
                    removeUserAttribute: function() {
                
                    },
                };
            }
            return currentUser;
        }
    };

    beforeEach(function() {
        // You may require userAttributes or userIdentities to be passed into initialization
        var userAttributes = {
            color: 'green'
        };
        var userIdentities = [{
            Identity: 'customerId',
            Type: IdentityType.CustomerId
        }, {
            Identity: 'email',
            Type: IdentityType.Email
        }, {
            Identity: 'facebook',
            Type: IdentityType.Facebook
        }];
        mParticle.forwarder.init(SDKsettings, reportService.cb, true, null, userAttributes, userIdentities);
    });

    it('sets values from mapping under GDPR consent using the Didomi consent status', function(done) {
        // Set the consent status from didomi
        Didomi.setUserStatus({
            purposes: {
                consent: {
                    enabled: ['didomi_purpose1'],
                    disabled: ['didomi_purpose2'],
                },
                legitimate_interest: {
                    enabled: ['didomilt_purpose1'],
                    disabled: ['didomilt_purpose2'],
                },
            },
        });

        // The Didomi event listener is not called right away; we force an update triggering mParticle.
        mParticle.forwarder.onUserIdentified(mParticle.Identity.getCurrentUser());

        // Get the GDPR consent from the user
        const user = mParticle.Identity.getCurrentUser();
        const consent = user.consentState.getGDPRConsentState();

        // All purposes from the mapping should have GDPR consent.
        consent.should.have.property('mparticle_purpose1');
        consent.should.have.property('mparticle_purpose2');
        consent.should.have.property('mparticle_purpose3');
        consent.should.have.property('mparticle_purpose4');
        consent['mparticle_purpose1'].should.have.property('Consented', true);
        consent['mparticle_purpose2'].should.have.property('Consented', false);
        consent['mparticle_purpose3'].should.have.property('Consented', true);
        consent['mparticle_purpose4'].should.have.property('Consented', false);


        done();
    });
});

},{"./end-to-end-testapp/settings":23}]},{},[20]);
