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
