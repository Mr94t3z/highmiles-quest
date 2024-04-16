import mysql from 'mysql';
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

// Given data
const newData = [
    ['0xA4b73b39F73F73655e9fdC5D167c21b3fA4A1eD6', '222'],
    ['0x3FA42DCaBAD8e025d30b2b088446c4A3940F13bd', '333']
];

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
};

// Create a MySQL connection
const connection = mysql.createConnection(dbConfig);

// Connect to the database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Connected to MySQL database');
    
    // Call the function to update data in MySQL
    updateDataInMySQL(() => {
        // Close MySQL connection after updating data
        connection.end();
    });
});

// Function to update data in MySQL
function updateDataInMySQL(callback) {
    // Iterate through newData and update or insert into MySQL table
    let count = 0;
    newData.forEach(([address, points]) => {
        const sql = `INSERT INTO 1st_quest (address, points) VALUES (?, ?) 
                     ON DUPLICATE KEY UPDATE points = VALUES(points)`;
        
        connection.query(sql, [address, points], (err, result) => {
            if (err) {
                console.error('Error updating data in MySQL:', err);
            } else {
                console.log('Data updated in MySQL for address:', address);
            }

            // Check if all queries have been executed
            count++;
            if (count === newData.length) {
                callback(); // Invoke the callback to close the connection
            }
        });
    });
}

const create_table = `
    CREATE TABLE IF NOT EXISTS create_table (
    address VARCHAR(255) PRIMARY KEY,
    points INT
    );
    `

const delete_data = 
    `
    DELETE FROM table_name
    WHERE address 
    IN 
    ('0x86924c37A93734E8611Eb081238928a9d18a63c0', '0xa260CF1726a6a5e0B7079f708823FC8E884611CB', '0xF143db60A0B1cBb8076B786Eb6635b93f18db744');
    `

const clear_table = 
    `
    DELETE FROM 1st_quest;
    DELETE FROM 2nd_quest;
    DELETE FROM 3rd_quest;
    DELETE FROM 4th_quest;
    DELETE FROM 5th_quest;
    DELETE FROM 6th_quest;
    DELETE FROM 7th_quest;
    DELETE FROM 8th_quest;
    DELETE FROM 9th_quest;
    DELETE FROM 10th_quest;
    DELETE FROM 11th_quest;
    DELETE FROM 12th_quest;
    DELETE FROM 13th_quest;
    DELETE FROM 14th_quest;
    DELETE FROM final_points;
    `