const TABLES = {
  USER: `
    CREATE TABLE IF NOT EXISTS User (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `,
  CAR: `
    CREATE TABLE IF NOT EXISTS Car (
      id INT PRIMARY KEY AUTO_INCREMENT,
      PlateNumber VARCHAR(50) UNIQUE NOT NULL,
      Type VARCHAR(100),
      Model VARCHAR(100),
      ManufacturingYear INT,
      DriverPhone VARCHAR(20),
      MechanicName VARCHAR(100),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `,
  SERVICES: `
    CREATE TABLE IF NOT EXISTS Services (
      id INT PRIMARY KEY AUTO_INCREMENT,
      ServiceCode VARCHAR(50) UNIQUE NOT NULL,
      ServiceName VARCHAR(100),
      ServicePrice DECIMAL(10, 2)
    )
  `,
  SERVICE_RECORD: `
    CREATE TABLE IF NOT EXISTS ServiceRecord (
      id INT PRIMARY KEY AUTO_INCREMENT,
      RecordNumber VARCHAR(50) UNIQUE NOT NULL,
      CarId INT,
      ServiceId INT,
      ServiceDate DATE,
      Description TEXT,
      Status VARCHAR(50),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (CarId) REFERENCES Car(id),
      FOREIGN KEY (ServiceId) REFERENCES Services(id)
    )
  `,
  PAYMENT: `
    CREATE TABLE IF NOT EXISTS Payment (
      id INT PRIMARY KEY AUTO_INCREMENT,
      RecordId INT,
      AmountPaid DECIMAL(10, 2),
      PaymentDate DATE,
      PaymentMethod VARCHAR(50),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (RecordId) REFERENCES ServiceRecord(id)
    )
  `
};

module.exports = TABLES;
