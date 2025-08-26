from flask import Blueprint, request, jsonify
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.models import Producto

productos_bp = Blueprint('productos', __name__, url_prefix='/productos')

@productos_bp.route('/', methods=['POST'])
def crear_producto():
    data = request.get_json()

    # Validar campos obligatorios
    if not data:
        return jsonify({"error": "Falta cuerpo JSON"}), 400

    required_fields = ['codigo_barra', 'nombre']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Faltan campos obligatorios"}), 400

    # Obtener datos
    codigo_barra = data['codigo_barra']
    nombre = data['nombre']
    descripcion = data.get('descripcion', '')
    stock = data.get('stock', 0)

    db = SessionLocal()

    try:
        # Verificar si ya existe
        producto_existente = db.query(Producto).filter_by(codigo_barra=codigo_barra).first()
        if producto_existente:
            return jsonify({"error": "Ya existe un producto con ese código de barras"}), 409

        # Crear producto
        nuevo_producto = Producto(
            codigo_barra=codigo_barra,
            nombre=nombre,
            descripcion=descripcion,
            stock=stock
        )

        db.add(nuevo_producto)
        db.commit()
        db.refresh(nuevo_producto)

        return jsonify({
            "mensaje": "Producto creado exitosamente",
            "producto": {
                "id": nuevo_producto.id,
                "codigo_barra": nuevo_producto.codigo_barra,
                "nombre": nuevo_producto.nombre,
                "descripcion": nuevo_producto.descripcion,
                "stock": nuevo_producto.stock
            }
        }), 201

    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        db.close()


    # Obtener todos los productos
@productos_bp.route('/', methods=['GET'])
def obtener_productos():
    filtro = request.args.get('filtro', '').strip()
    limite = int(request.args.get('limite', 50))
    offset = int(request.args.get('offset', 0))

    db = SessionLocal()

    query = db.query(Producto)
    if filtro:
        query = query.filter(
            Producto.nombre.ilike(f"%{filtro}%") |
            Producto.codigo_barra.ilike(f"%{filtro}%")
        )

    productos = query.offset(offset).limit(limite).all()
    db.close()

    resultado = [{
        "id": p.id,
        "codigo_barra": p.codigo_barra,
        "nombre": p.nombre,
        "descripcion": p.descripcion,
        "stock": p.stock,
        "fecha_actualizacion": p.fecha_actualizacion.strftime("%Y-%m-%d %H:%M:%S")
    } for p in productos]

    return jsonify(resultado)


# Sumar stock
@productos_bp.route('/<codigo_barra>/sumar', methods=['PUT'])
def sumar_stock(codigo_barra):
    session: Session = SessionLocal()
    data = request.get_json()
    cantidad = data.get('cantidad', 0)

    try:
        producto = session.query(Producto).filter_by(codigo_barra=codigo_barra).first()

        if not producto:
            return jsonify({"error": "Producto no encontrado"}), 404

        producto.stock += cantidad
        session.commit()

        return jsonify({"mensaje": "Stock actualizado", "nuevo_stock": producto.stock})

    except Exception as e:
        session.rollback()
        return jsonify({"error": "Error al sumar stock", "detalles": str(e)}), 500

    finally:
        session.close()


# Restar stock
@productos_bp.route('/<codigo_barra>/restar', methods=['PUT'])
def restar_stock(codigo_barra):
    session: Session = SessionLocal()
    data = request.get_json()
    cantidad = data.get('cantidad', 0)

    try:
        producto = session.query(Producto).filter_by(codigo_barra=codigo_barra).first()

        if not producto:
            return jsonify({"error": "Producto no encontrado"}), 404

        if producto.stock < cantidad:
            return jsonify({"error": "Stock insuficiente"}), 400

        producto.stock -= cantidad
        session.commit()

        return jsonify({"mensaje": "Stock actualizado", "nuevo_stock": producto.stock})

    except Exception as e:
        session.rollback()
        return jsonify({"error": "Error al restar stock", "detalles": str(e)}), 500

    finally:
        session.close()

# Modificar directamente el valor de stock
@productos_bp.route('/<codigo_barra>/modificar', methods=['PUT'])
def modificar_stock(codigo_barra):
    data = request.get_json()
    nuevo_stock = data.get('stock')

    # Validar existencia del campo y que sea un número no negativo
    if nuevo_stock is None or not isinstance(nuevo_stock, int) or nuevo_stock < 0:
        return jsonify({"error": "Stock debe ser un número entero mayor o igual a 0"}), 400

    db = SessionLocal()
    producto = db.query(Producto).filter_by(codigo_barra=codigo_barra).first()

    if not producto:
        db.close()
        return jsonify({"error": "Producto no encontrado"}), 404

    producto.stock = nuevo_stock
    db.commit()
    db.refresh(producto)
    db.close()

    return jsonify({
        "mensaje": "Stock modificado correctamente",
        "nuevo_stock": producto.stock
    })

# Obtener un producto por código de barras
@productos_bp.route('/<codigo_barra>', methods=['GET'])
def obtener_producto(codigo_barra):
    db = SessionLocal()
    producto = db.query(Producto).filter_by(codigo_barra=codigo_barra).first()
    db.close()

    if not producto:
        return jsonify({"error": "Producto no encontrado"}), 404

    return jsonify({
        "id": producto.id,
        "codigo_barra": producto.codigo_barra,
        "nombre": producto.nombre,
        "descripcion": producto.descripcion,
        "stock": producto.stock,
        "fecha_actualizacion": producto.fecha_actualizacion.strftime("%Y-%m-%d %H:%M:%S")
    })

@productos_bp.route('/<codigo_barra>', methods=['DELETE'])
def eliminar_producto(codigo_barra):
    db = SessionLocal()
    producto = db.query(Producto).filter_by(codigo_barra=codigo_barra).first()

    if not producto:
        db.close()
        return jsonify({"error": "Producto no encontrado"}), 404

    db.delete(producto)
    db.commit()
    db.close()

    return jsonify({"mensaje": "Producto eliminado correctamente"})

    db.add(nuevo_producto)
    db.commit()
    db.refresh(nuevo_producto)
    db.close()

    return jsonify({
        "mensaje": "Producto creado exitosamente",
        "producto": {
            "id": nuevo_producto.id,
            "codigo_barra": nuevo_producto.codigo_barra,
            "nombre": nuevo_producto.nombre,
            "descripcion": nuevo_producto.descripcion,
            "stock": nuevo_producto.stock
        }
    }), 201
