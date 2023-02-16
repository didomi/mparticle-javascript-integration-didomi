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
