const fs = require('fs');

const raw = JSON.parse(
  fs.readFileSync(
    'C:/Users/VICTUS/.gemini/antigravity-ide/brain/76d6a5b5-db6c-407c-a367-9829fa10cfc4/.system_generated/steps/889/output.txt',
    'utf8'
  )
);
const origCol = raw.collection;

const tripId = 'a3818139-00f7-4a43-945c-aa753fd3a271';
const seatId = '07a2214f-4cb9-49d5-8153-9a4e5ffc6ea3';

// Add tests script to Login to save accessToken into collection variables
origCol.item.forEach((folder) => {
  if (folder.name === 'Auth') {
    folder.item.forEach((reqItem) => {
      if (reqItem.name === 'Login') {
        reqItem.event = [
          {
            listen: 'test',
            script: {
              type: 'text/javascript',
              exec: [
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'var jsonData = pm.response.json();',
                'if (jsonData && jsonData.data && jsonData.data.accessToken) {',
                '    pm.collectionVariables.set("accessToken", jsonData.data.accessToken);',
                '} else if (jsonData && jsonData.data && jsonData.data.tokens && jsonData.data.tokens.accessToken) {',
                '    pm.collectionVariables.set("accessToken", jsonData.data.tokens.accessToken);',
                '}'
              ]
            }
          }
        ];
      }
    });
  }
});

const bookingFolder = {
  name: 'Booking-service',
  id: 'f7a8b9c0-d1e2-43f5-a6b7-c8d9e0f1a2b3',
  item: [
    {
      name: 'Check Seat Availability - Available',
      id: 'b1e2f3a4-c5d6-47e8-9012-111111111101',
      event: [
        {
          listen: 'test',
          script: {
            type: 'text/javascript',
            exec: [
              'pm.test("Status code is 200", function () {',
              '    pm.response.to.have.status(200);',
              '});',
              'pm.test("Seat segment is available", function () {',
              '    var jsonData = pm.response.json();',
              '    pm.expect(jsonData.success).to.be.true;',
              '    pm.expect(jsonData.data.available).to.be.true;',
              '});'
            ]
          }
        }
      ],
      request: {
        method: 'GET',
        header: [],
        url: {
          raw: `http://localhost:3000/api/bookings/trips/${tripId}/seats/${seatId}/availability?from=1&to=3`,
          protocol: 'http',
          host: ['localhost'],
          port: '3000',
          path: ['api', 'bookings', 'trips', tripId, 'seats', seatId, 'availability'],
          query: [
            { key: 'from', value: '1' },
            { key: 'to', value: '3' }
          ]
        }
      },
      response: []
    },
    {
      name: 'Create Seat Hold (PENDING)',
      id: 'b1e2f3a4-c5d6-47e8-9012-111111111102',
      event: [
        {
          listen: 'test',
          script: {
            type: 'text/javascript',
            exec: [
              'pm.test("Status code is 201 Created", function () {',
              '    pm.response.to.have.status(201);',
              '});',
              'pm.test("Hold created with PENDING status and expiration time", function () {',
              '    var jsonData = pm.response.json();',
              '    pm.expect(jsonData.success).to.be.true;',
              '    pm.expect(jsonData.data.status).to.eql("PENDING");',
              '    pm.expect(jsonData.data.fromStopSeq).to.eql(1);',
              '    pm.expect(jsonData.data.toStopSeq).to.eql(3);',
              '    pm.expect(jsonData.data.holdExpiresAt).to.not.be.null;',
              '    if (jsonData.data.id) {',
              '        pm.collectionVariables.set("bookingId", jsonData.data.id);',
              '    }',
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
          raw: JSON.stringify(
            {
              tripId: tripId,
              seatId: seatId,
              fromStopSeq: 1,
              toStopSeq: 3
            },
            null,
            2
          ),
          options: { raw: { language: 'json' } }
        },
        url: {
          raw: 'http://localhost:3000/api/bookings/hold',
          protocol: 'http',
          host: ['localhost'],
          port: '3000',
          path: ['api', 'bookings', 'hold']
        }
      },
      response: []
    },
    {
      name: 'Check Seat Availability - Overlapping Hold (Unavailable)',
      id: 'b1e2f3a4-c5d6-47e8-9012-111111111103',
      event: [
        {
          listen: 'test',
          script: {
            type: 'text/javascript',
            exec: [
              'pm.test("Status code is 200", function () {',
              '    pm.response.to.have.status(200);',
              '});',
              'pm.test("Seat segment is NOT available due to overlapping hold", function () {',
              '    var jsonData = pm.response.json();',
              '    pm.expect(jsonData.success).to.be.true;',
              '    pm.expect(jsonData.data.available).to.be.false;',
              '});'
            ]
          }
        }
      ],
      request: {
        method: 'GET',
        header: [],
        url: {
          raw: `http://localhost:3000/api/bookings/trips/${tripId}/seats/${seatId}/availability?from=2&to=4`,
          protocol: 'http',
          host: ['localhost'],
          port: '3000',
          path: ['api', 'bookings', 'trips', tripId, 'seats', seatId, 'availability'],
          query: [
            { key: 'from', value: '2' },
            { key: 'to', value: '4' }
          ]
        }
      },
      response: []
    },
    {
      name: 'Attempt Overlapping Hold (Expects 409 Conflict)',
      id: 'b1e2f3a4-c5d6-47e8-9012-111111111104',
      event: [
        {
          listen: 'test',
          script: {
            type: 'text/javascript',
            exec: [
              'pm.test("Status code is 409 Conflict", function () {',
              '    pm.response.to.have.status(409);',
              '});',
              'pm.test("Returns conflict error response", function () {',
              '    var jsonData = pm.response.json();',
              '    pm.expect(jsonData.success).to.be.false;',
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
          raw: JSON.stringify(
            {
              tripId: tripId,
              seatId: seatId,
              fromStopSeq: 2,
              toStopSeq: 4
            },
            null,
            2
          ),
          options: { raw: { language: 'json' } }
        },
        url: {
          raw: 'http://localhost:3000/api/bookings/hold',
          protocol: 'http',
          host: ['localhost'],
          port: '3000',
          path: ['api', 'bookings', 'hold']
        }
      },
      response: []
    },
    {
      name: 'Create Adjacent Non-Overlapping Hold (Segment 3 -> 5 - Succeeds)',
      id: 'b1e2f3a4-c5d6-47e8-9012-111111111105',
      event: [
        {
          listen: 'test',
          script: {
            type: 'text/javascript',
            exec: [
              'pm.test("Status code is 201 Created", function () {',
              '    pm.response.to.have.status(201);',
              '});',
              'pm.test("Adjacent hold created successfully on same seat", function () {',
              '    var jsonData = pm.response.json();',
              '    pm.expect(jsonData.success).to.be.true;',
              '    pm.expect(jsonData.data.status).to.eql("PENDING");',
              '    pm.expect(jsonData.data.fromStopSeq).to.eql(3);',
              '    pm.expect(jsonData.data.toStopSeq).to.eql(5);',
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
          raw: JSON.stringify(
            {
              tripId: tripId,
              seatId: seatId,
              fromStopSeq: 3,
              toStopSeq: 5
            },
            null,
            2
          ),
          options: { raw: { language: 'json' } }
        },
        url: {
          raw: 'http://localhost:3000/api/bookings/hold',
          protocol: 'http',
          host: ['localhost'],
          port: '3000',
          path: ['api', 'bookings', 'hold']
        }
      },
      response: []
    },
    {
      name: 'Create Hold Without Token (Expects 401 Unauthorized)',
      id: 'b1e2f3a4-c5d6-47e8-9012-111111111106',
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
        header: [{ key: 'Content-Type', value: 'application/json' }],
        body: {
          mode: 'raw',
          raw: JSON.stringify(
            {
              tripId: tripId,
              seatId: seatId,
              fromStopSeq: 1,
              toStopSeq: 2
            },
            null,
            2
          ),
          options: { raw: { language: 'json' } }
        },
        url: {
          raw: 'http://localhost:3000/api/bookings/hold',
          protocol: 'http',
          host: ['localhost'],
          port: '3000',
          path: ['api', 'bookings', 'hold']
        }
      },
      response: []
    }
  ]
};

// Check if Booking-service already exists, replace or append
const existingIndex = origCol.item.findIndex((f) => f.name === 'Booking-service');
if (existingIndex >= 0) {
  origCol.item[existingIndex] = bookingFolder;
} else {
  origCol.item.push(bookingFolder);
}

const cleanPayload = {
  info: {
    _postman_id: origCol.info._postman_id,
    name: origCol.info.name,
    schema: origCol.info.schema
  },
  item: origCol.item,
  variable: [
    { key: 'tripId', value: tripId },
    { key: 'seatId', value: seatId },
    { key: 'accessToken', value: '' },
    { key: 'bookingId', value: '' }
  ]
};

fs.writeFileSync(
  'C:/Users/VICTUS/.gemini/antigravity-ide/brain/76d6a5b5-db6c-407c-a367-9829fa10cfc4/scratch/put_collection_booking.json',
  JSON.stringify(cleanPayload, null, 2)
);

console.log('Successfully prepared collection payload with Booking-service tests!');
