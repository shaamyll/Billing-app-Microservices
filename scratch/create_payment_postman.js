const fs = require('fs');
const path = require('path');

const srcPath = 'C:/Users/VICTUS/.gemini/antigravity-ide/brain/76d6a5b5-db6c-407c-a367-9829fa10cfc4/.system_generated/steps/1457/output.txt';
const raw = JSON.parse(fs.readFileSync(srcPath, 'utf8'));
const col = raw.collection;

// Ensure collection variables exist
if (!col.variable) col.variable = [];
const varKeys = new Set(col.variable.map(v => v.key));
if (!varKeys.has('paymentId')) col.variable.push({ key: 'paymentId', value: '' });
if (!varKeys.has('paymentIdempotencyKey')) col.variable.push({ key: 'paymentIdempotencyKey', value: '' });
if (!varKeys.has('lastPaymentStatus')) col.variable.push({ key: 'lastPaymentStatus', value: '' });

// Filter out existing Payment-service folder if already present
col.item = col.item.filter(f => f.name !== 'Payment-service' && f.name !== 'Payment Service');

// Build Payment-service folder
const paymentFolder = {
  name: 'Payment-service',
  id: 'd2e3f4a5-b6c7-48d9-0123-333333333300',
  item: [
    {
      name: '1. Process Charge (Fresh Idempotency-Key)',
      id: 'd2e3f4a5-b6c7-48d9-0123-333333333301',
      event: [
        {
          listen: 'prerequest',
          script: {
            type: 'text/javascript',
            exec: [
              'var freshKey = "idemp-" + Date.now() + "-" + Math.floor(Math.random() * 1000);',
              'pm.collectionVariables.set("paymentIdempotencyKey", freshKey);'
            ]
          }
        },
        {
          listen: 'test',
          script: {
            type: 'text/javascript',
            exec: [
              'pm.test("Status code is 201 Created or 200 OK", function () {',
              '    pm.expect(pm.response.code).to.be.oneOf([200, 201]);',
              '});',
              'var jsonData = pm.response.json();',
              'pm.test("Response indicates charge processed", function () {',
              '    pm.expect(jsonData.success).to.be.true;',
              '    pm.expect(jsonData.data).to.have.property("paymentId");',
              '    pm.expect(jsonData.data).to.have.property("status");',
              '});',
              'if (jsonData.data && jsonData.data.paymentId) {',
              '    pm.collectionVariables.set("paymentId", jsonData.data.paymentId);',
              '    pm.collectionVariables.set("lastPaymentStatus", jsonData.data.status);',
              '}'
            ]
          }
        }
      ],
      request: {
        method: 'POST',
        header: [
          { key: 'Content-Type', value: 'application/json' },
          { key: 'Authorization', value: 'Bearer {{accessToken}}' },
          { key: 'Idempotency-Key', value: '{{paymentIdempotencyKey}}' }
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            bookingId: '{{bookingId}}',
            amount: 450,
            currency: 'INR'
          }, null, 2),
          options: { raw: { language: 'json' } }
        },
        url: {
          raw: 'http://localhost:3000/api/payments/charge',
          protocol: 'http',
          host: ['localhost'],
          port: '3000',
          path: ['api', 'payments', 'charge']
        }
      },
      response: []
    },
    {
      name: '2. Process Charge (Idempotent Replay - Same Key)',
      id: 'd2e3f4a5-b6c7-48d9-0123-333333333302',
      event: [
        {
          listen: 'test',
          script: {
            type: 'text/javascript',
            exec: [
              'pm.test("Status code is 200 OK for idempotent replay", function () {',
              '    pm.response.to.have.status(200);',
              '});',
              'var jsonData = pm.response.json();',
              'pm.test("Idempotent replay returns same payment without duplicating", function () {',
              '    pm.expect(jsonData.data.isIdempotentReplay).to.be.true;',
              '    pm.expect(jsonData.data.paymentId).to.eql(pm.collectionVariables.get("paymentId"));',
              '});'
            ]
          }
        }
      ],
      request: {
        method: 'POST',
        header: [
          { key: 'Content-Type', value: 'application/json' },
          { key: 'Authorization', value: 'Bearer {{accessToken}}' },
          { key: 'Idempotency-Key', value: '{{paymentIdempotencyKey}}' }
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            bookingId: '{{bookingId}}',
            amount: 450,
            currency: 'INR'
          }, null, 2),
          options: { raw: { language: 'json' } }
        },
        url: {
          raw: 'http://localhost:3000/api/payments/charge',
          protocol: 'http',
          host: ['localhost'],
          port: '3000',
          path: ['api', 'payments', 'charge']
        }
      },
      response: []
    },
    {
      name: '3. Get Payment by ID',
      id: 'd2e3f4a5-b6c7-48d9-0123-333333333303',
      event: [
        {
          listen: 'test',
          script: {
            type: 'text/javascript',
            exec: [
              'pm.test("Status code is 200 OK", function () {',
              '    pm.response.to.have.status(200);',
              '});',
              'var jsonData = pm.response.json();',
              'pm.test("Payment record matches stored paymentId", function () {',
              '    pm.expect(jsonData.data.id).to.eql(pm.collectionVariables.get("paymentId"));',
              '});'
            ]
          }
        }
      ],
      request: {
        method: 'GET',
        header: [
          { key: 'Authorization', value: 'Bearer {{accessToken}}' }
        ],
        url: {
          raw: 'http://localhost:3000/api/payments/{{paymentId}}',
          protocol: 'http',
          host: ['localhost'],
          port: '3000',
          path: ['api', 'payments', '{{paymentId}}']
        }
      },
      response: []
    },
    {
      name: '4. Refund Payment',
      id: 'd2e3f4a5-b6c7-48d9-0123-333333333304',
      event: [
        {
          listen: 'test',
          script: {
            type: 'text/javascript',
            exec: [
              'var jsonData = pm.response.json();',
              'if (pm.collectionVariables.get("lastPaymentStatus") === "SUCCEEDED") {',
              '    pm.test("Status code is 200 OK for refund", function () {',
              '        pm.response.to.have.status(200);',
              '    });',
              '    pm.test("Status transitioned to REFUNDED", function () {',
              '        pm.expect(jsonData.data.status).to.eql("REFUNDED");',
              '    });',
              '} else {',
              '    pm.test("Status code is 400 Bad Request when refunding non-succeeded payment", function () {',
              '        pm.response.to.have.status(400);',
              '    });',
              '}'
            ]
          }
        }
      ],
      request: {
        method: 'POST',
        header: [
          { key: 'Authorization', value: 'Bearer {{accessToken}}' }
        ],
        url: {
          raw: 'http://localhost:3000/api/payments/{{paymentId}}/refund',
          protocol: 'http',
          host: ['localhost'],
          port: '3000',
          path: ['api', 'payments', '{{paymentId}}', 'refund']
        }
      },
      response: []
    },
    {
      name: '5. Refund Already-Refunded Payment (Expects 409 Conflict)',
      id: 'd2e3f4a5-b6c7-48d9-0123-333333333305',
      event: [
        {
          listen: 'test',
          script: {
            type: 'text/javascript',
            exec: [
              'pm.test("Status code is 409 Conflict or 400 Bad Request", function () {',
              '    pm.expect(pm.response.code).to.be.oneOf([409, 400]);',
              '});'
            ]
          }
        }
      ],
      request: {
        method: 'POST',
        header: [
          { key: 'Authorization', value: 'Bearer {{accessToken}}' }
        ],
        url: {
          raw: 'http://localhost:3000/api/payments/{{paymentId}}/refund',
          protocol: 'http',
          host: ['localhost'],
          port: '3000',
          path: ['api', 'payments', '{{paymentId}}', 'refund']
        }
      },
      response: []
    },
    {
      name: '6. Charge Without Idempotency-Key (Expects 400 Bad Request)',
      id: 'd2e3f4a5-b6c7-48d9-0123-333333333306',
      event: [
        {
          listen: 'test',
          script: {
            type: 'text/javascript',
            exec: [
              'pm.test("Status code is 400 Bad Request", function () {',
              '    pm.response.to.have.status(400);',
              '});',
              'var jsonData = pm.response.json();',
              'pm.test("Error message mentions Idempotency-Key header", function () {',
              '    pm.expect(jsonData.message).to.match(/idempotency-key/i);',
              '});'
            ]
          }
        }
      ],
      request: {
        method: 'POST',
        header: [
          { key: 'Content-Type', value: 'application/json' },
          { key: 'Authorization', value: 'Bearer {{accessToken}}' }
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            bookingId: '{{bookingId}}',
            amount: 450
          }, null, 2),
          options: { raw: { language: 'json' } }
        },
        url: {
          raw: 'http://localhost:3000/api/payments/charge',
          protocol: 'http',
          host: ['localhost'],
          port: '3000',
          path: ['api', 'payments', 'charge']
        }
      },
      response: []
    },
    {
      name: '7. Charge Without Auth Token (Expects 401 Unauthorized)',
      id: 'd2e3f4a5-b6c7-48d9-0123-333333333307',
      event: [
        {
          listen: 'test',
          script: {
            type: 'text/javascript',
            exec: [
              'pm.test("Status code is 401 Unauthorized", function () {',
              '    pm.response.to.have.status(401);',
              '});'
            ]
          }
        }
      ],
      request: {
        method: 'POST',
        header: [
          { key: 'Content-Type', value: 'application/json' },
          { key: 'Idempotency-Key', value: 'no-auth-test-key' }
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            bookingId: '{{bookingId}}',
            amount: 450
          }, null, 2),
          options: { raw: { language: 'json' } }
        },
        url: {
          raw: 'http://localhost:3000/api/payments/charge',
          protocol: 'http',
          host: ['localhost'],
          port: '3000',
          path: ['api', 'payments', 'charge']
        }
      },
      response: []
    }
  ]
};

col.item.push(paymentFolder);

const outPath = 'C:/Users/VICTUS/.gemini/antigravity-ide/brain/76d6a5b5-db6c-407c-a367-9829fa10cfc4/scratch/put_collection_payment.json';
fs.writeFileSync(outPath, JSON.stringify({ collection: col }, null, 2));
console.log('Saved payload to:', outPath);
console.log('Folders in payload:', col.item.map(i => i.name));
