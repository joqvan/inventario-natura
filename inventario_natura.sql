-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS inventario_natura;
USE inventario_natura;

-- Crear la tabla productos
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_barra VARCHAR(50),
    nombre VARCHAR(100),
    descripcion TEXT,
    stock INT,
    fecha_actualizacion DATETIME
);