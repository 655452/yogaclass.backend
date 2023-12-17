// yoga-class-backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
app.use(cors());
const port = 3001;
const mysql = require('mysql2');

app.use(bodyParser.json());

// Database connection configuration
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456789',
  database: 'YogaClasses',
});

connection.connect((err) => {
  if (err) {
    console.error('Database connection failed: ', err.stack);
    return;
  }
  console.log('Connected to the database');
});

// Define the Enrollment model (Corrected)
const createEnrollmentTable = async () => {
  try {
    await connection.query(`
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
      const { firstName, lastName, age } = req.body;
  
      // Basic validation
      if (!firstName || !lastName || !age) {
        return res.status(400).json({ error: 'Please provide all fields.' });
      }
  
      // Example: Retrieve ParticipantID based on first name, last name, and age
      const [participant] = await connection.query(
        'SELECT ParticipantID FROM Participants WHERE FirstName = ? AND LastName = ? AND Age = ?',
        [firstName, lastName, age]
      );
  
      if (!participant) {
        return res.status(404).json({ error: 'Participant not found.' });
      }
  
      const ParticipantID = participant[0].ParticipantID;
  
      // Example: Retrieve BatchID based on chosen batch start time
      const [batch] = await connection.query(
        'SELECT BatchID FROM Batches WHERE StartTime = ?',
        ['06:00:00'] // Adjust based on your random data
      );
  
      if (!batch) {
        return res.status(404).json({ error: 'Batch not found.' });
      }
  
      const BatchID = batch[0].BatchID;
  
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
    } catch (error) {
      console.error('Error during enrollment:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });
  
  // Start the server
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  