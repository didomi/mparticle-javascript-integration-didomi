var initialization = {
    name: 'Didomi',
    moduleId: 9999999,
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
