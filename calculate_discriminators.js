const crypto = require('crypto');

function calculateEventDiscriminator(eventName) {
  const preimage = `event:${eventName}`;
  const hash = crypto.createHash('sha256').update(preimage).digest();
  return Array.from(hash.slice(0, 8));
}

const events = [
  'ChanceCardDrawn',
  'CommunityChestCardDrawn',
  'PlayerPassedGo',
  'GameEnded',
  'TradeCreated',
  'TradeAccepted',
  'TradeRejected',
  'TradeCancelled',
  'TradesCleanedUp',
  'PropertyPurchased',
  'RentPaid',
  'HouseBuilt',
  'HotelBuilt',
  'BuildingSold',
  'PropertyMortgaged',
  'PropertyUnmortgaged',
  'PlayerJoined',
  'GameStarted',
  'SpecialSpaceAction',
  'PlayerBankrupt'
];

console.log('Event Discriminators:');
events.forEach(eventName => {
  const discriminator = calculateEventDiscriminator(eventName);
  console.log(`export const ${eventName.toUpperCase().replace(/([A-Z])/g, '_$1').substring(1)}_EVENT_DISCRIMINATOR = new Uint8Array([`);
  console.log(`  ${discriminator.join(', ')},`);
  console.log(`]);`);
  console.log('');
});