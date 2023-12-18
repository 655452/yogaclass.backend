// yoga-class-backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
app.use(cors());
const port = 3001;
const mysql = require('mysql2');

app.use(bodyParser.json());

const { getConnection } = require('./db'); // Adjust the path based on your project structure



// Database connection configuration
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Asit@123',
  database: 'YogaClasses',
  waitForConnections: true,
  connectionLimit: 10, // Adjust based on your needs
  queueLimit: 0,
});





connection.connect((err) => {
  if (err) {
    console.error('Database connection failed: ', err.stack);
    return;
  }
  console.log('Connected to the database');
});

// Define the Enrollment model (Corrected)

const createParticipantsTable = async () => {
  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Participants (
        ParticipantID INT PRIMARY KEY AUTO_INCREMENT,
        FirstName VARCHAR(255),
        LastName VARCHAR(255),
        Age INT
      );
    `);
    console.log('Participants table created or already exists');
  } catch (error) {
    console.error('Error creating Participants table:', error);
  }
};
const createBatchesTable = async () => {
  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Batches (
        BatchID INT PRIMARY KEY AUTO_INCREMENT,
        StartTime TIME
      );
    `);
    console.log('Batches table created or already exists');
  } catch (error) {
    console.error('Error creating Batches table:', error);
  }
};
const createEnrollmentTable = async () => {
  try {
     // Create Batches table first
     await createBatchesTable();
      // Create Participants table first
      await createParticipantsTable();
    // const connection = await getConnection(); // Get a connection from the pool
 
  
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Enrollment (
        EnrollmentID INT PRIMARY KEY AUTO_INCREMENT,
        ParticipantID INT,
        BatchID INT,
        EnrollmentDate DATE NOT NULL,
        CONSTRAINT FK_Participant FOREIGN KEY (ParticipantID) REFERENCES Participants(ParticipantID),
        CONSTRAINT FK_Batch FOREIGN KEY (BatchID) REFERENCES Batches(BatchID),
        CONSTRAINT UC_Enrollment UNIQUE (ParticipantID, EnrollmentDate)
      );
    `);
    console.log('Enrollment table created or already exists');
  } catch (error) {
    console.error('Error creating Enrollment table:', error);
  }
};

// Call the function to create the Enrollment table
createEnrollmentTable();

// Other model definitions (Participants, Batches, Payments) here

// Mock function for payment (Define this function or remove the call if not needed)
const CompletePayment = (/* Payment details */) => {
  // Your implementation here
  return { success: true /* or false */, message: 'Payment processed' };
};

// yoga-class-backend/server.js
// ... (existing code)

// REST API endpoint for enrollment
app.post('/enroll', async (req, res) => {
    try {
      const connection = await getConnection(); // Get a connection from the pool


      const { firstName, lastName, age } = req.body;
      console.log(req.body);
  
      // Basic validation
      if (!firstName || !lastName || !age) {
        return res.status(400).json({ error: 'Please provide all fields.' });
      }
  
      // Example: Retrieve ParticipantID based on first name, last name, and age
    // Check if the participant already exists
    const [existingParticipant] = await connection.query(
      'SELECT ParticipantID FROM Participants WHERE FirstName = ? AND LastName = ? AND Age = ?',
      [firstName, lastName, age]
    );

    let participantID;

    if (existingParticipant.length > 0) {
      // If the participant exists, use their ID
      participantID = existingParticipant[0].ParticipantID;
    } else {
      // If the participant does not exist, insert a new participant and get their ID
      const [insertResult] = await connection.query(
        'INSERT INTO Participants (FirstName, LastName, Age) VALUES (?, ?, ?)',
        [firstName, lastName, age]
      );

      participantID = insertResult.insertId;
    }
  
  //     if (!participant || participant.length === 0) {
  // return res.status(404).json({ error: 'Participant not found.' });
// }
      const ParticipantID =participantID;
  
      // Example: Retrieve BatchID based on chosen batch start time
      const [existingBatch] = await connection.query(
        'SELECT BatchID FROM Batches WHERE StartTime = ?',
        ['06:00:00'] // Adjust based on your random data
      );
  
      let batchID;
      let batchStartTime='06:00:00';

      if (existingBatch.length > 0) {
        // If the batch exists, use its ID
        batchID = existingBatch[0].BatchID;
      } else {
        // If the batch does not exist, insert a new batch and get its ID
        const [insertBatchResult] = await connection.query(
          'INSERT INTO Batches (StartTime) VALUES (?)',
          [batchStartTime]
        );
  
        batchID = insertBatchResult.insertId;
      }
  
      const BatchID = batchID;
  
      // Insert the enrollment data into the database
      const enrollmentResult = await connection.query(
        'INSERT INTO Enrollment (ParticipantID, BatchID, EnrollmentDate) VALUES (?, ?, NOW())',
        [ParticipantID, BatchID]
      );
  
      // Mock function for payment (CompletePayment)
      const paymentResponse = CompletePayment(/* Payment details */);
  
      // Handle the payment response
      if (paymentResponse.success) {
        res.json({ success: true, message: 'Enrollment and payment successful.' });
      } else {
        res.json({ success: false, message: 'Payment failed.' });
      }

      connection.release(); // Release the connection back to the pool

    } catch (error) {
      console.error('Error during enrollment:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });
  
  // Start the server
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  