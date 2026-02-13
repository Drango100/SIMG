import mysql from 'mysql2/promise';

// Configuración para conectar sin especificar base de datos
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
};

const databaseName = 'simg';
const loginDatabaseName = 'login_2024';

async function createDatabaseIfNotExists() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Conectado a MySQL sin base de datos.');

        // Verificar y crear 'simg'
        const [rows] = await connection.execute('SHOW DATABASES');
        const databases = rows.map(row => Object.values(row)[0]);
        
        if (!databases.includes(databaseName)) {
            await connection.execute(`CREATE DATABASE ${databaseName}`);
            console.log(`Base de datos '${databaseName}' creada exitosamente.`);
        } else {
            console.log(`Base de datos '${databaseName}' ya existe.`);
        }

        // Verificar y crear 'login_2024'
        if (!databases.includes(loginDatabaseName)) {
            await connection.execute(`CREATE DATABASE ${loginDatabaseName}`);
            console.log(`Base de datos '${loginDatabaseName}' creada exitosamente.`);
        } else {
            console.log(`Base de datos '${loginDatabaseName}' ya existe.`);
        }

        await connection.end();
    } catch (error) {
        console.error('Error al crear/verificar las bases de datos:', error);
        process.exit(1);
    }
}

async function createTables() {
    try {
        // Conectar a 'simg' y crear tablas
        const poolSimg = mysql.createPool({
            ...dbConfig,
            database: databaseName,
        });

        console.log('Conectado a la base de datos simg. Creando tablas si no existen...');

        // ... [tablas de simg existentes]

        console.log('Tablas de simg creadas o ya existen.');
        await poolSimg.end();

        // Conectar a 'login_2024' y crear tabla usuarios
        const poolLogin = mysql.createPool({
            ...dbConfig,
            database: loginDatabaseName,
        });

        console.log('Conectado a la base de datos login_2024. Creando tabla usuarios si no existe...');

        await poolLogin.execute(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuario VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        console.log('Tabla usuarios creada o ya existe.');
        await poolLogin.end();
    } catch (error) {
        console.error('Error al crear tablas:', error);
        process.exit(1);
    }
}

async function runMigration() {
    await createDatabaseIfNotExists();
    await createTables();
    console.log('Migración completada.');
}

runMigration();