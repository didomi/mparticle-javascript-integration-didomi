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
