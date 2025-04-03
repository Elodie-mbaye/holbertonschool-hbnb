from flask import Flask
from flask_cors import CORS
from flask_restx import Api
from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager

db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()

def create_app(config_class="config.DevelopmentConfig"):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Appliquer CORS à l'application Flask entière
    CORS(app, resources={r"/*": {"origins": "http://127.0.0.1:5502"}})

    authorizations = {
        'token': {
            'type': 'apiKey',
            'in': 'header',
            'name': 'Authorization',
        }
    }
    api = Api(app, version='1.0', title='HBnB API',
              authorizations=authorizations,
              description='HBnB Application API')

    # Importer et enregistrer les namespaces
    from app.api.v1.admin import api as admin_ns
    from app.api.v1.auth import api as auth_ns
    from app.api.v1.users import api as users_ns
    from app.api.v1.amenities import api as amenities_ns
    from app.api.v1.places import api as places_ns
    from app.api.v1.reviews import api as reviews_ns

    api.add_namespace(admin_ns, path='/api/v1/admin')
    api.add_namespace(auth_ns, path='/api/v1/auth')
    api.add_namespace(users_ns, path='/api/v1/users')
    api.add_namespace(places_ns, path='/api/v1/places')
    api.add_namespace(amenities_ns, path='/api/v1/amenities')
    api.add_namespace(reviews_ns, path='/api/v1/reviews')

    bcrypt.init_app(app)
    jwt.init_app(app)
    db.init_app(app)

    from app.models.user import User
    from app.models.amenity import Amenity
    from app.models.place import Place
    from app.models.review import Review

    with app.app_context():
        db.create_all()

    return app
