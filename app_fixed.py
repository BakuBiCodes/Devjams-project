from flask import Flask, render_template, request, jsonify, session, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_cors import CORS
from datetime import datetime
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///pitchdesk.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.static_folder = 'static'

# Initialize extensions
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
CORS(app)

# User model
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), default='student')  # student, verified, admin
    credits = db.Column(db.Integer, default=100)
    avatar = db.Column(db.String(120), default='default.png')
    bio = db.Column(db.Text, default='')
    linkedin = db.Column(db.String(120), default='')
    portfolio_pdf = db.Column(db.String(120), default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_verified = db.Column(db.Boolean, default=False)

    # Relationships
    ideas = db.relationship('Idea', backref='author', lazy=True)
    votes = db.relationship('Vote', backref='user', lazy=True)
    bookmarks = db.relationship('Bookmark', backref='user', lazy=True)

# Idea model
class Idea(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    image = db.Column(db.String(120), default='')
    allow_internships = db.Column(db.Boolean, default=False)
    skills_required = db.Column(db.Text, default='')
    internship_description = db.Column(db.Text, default='')
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    upvotes = db.Column(db.Integer, default=0)
    downvotes = db.Column(db.Integer, default=0)
    comments = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    # Relationships
    votes = db.relationship('Vote', backref='idea', lazy=True)

# Vote model
class Vote(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    vote_type = db.Column(db.String(10), nullable=False)  # upvote, downvote
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    idea_id = db.Column(db.Integer, db.ForeignKey('idea.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Bookmark model
class Bookmark(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    idea_id = db.Column(db.Integer, db.ForeignKey('idea.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Routes
@app.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))

    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        user = User.query.filter_by(email=email).first()
        if user and bcrypt.check_password_hash(user.password, password):
            login_user(user)
            return jsonify({'success': True, 'message': 'Login successful'})
        return jsonify({'success': False, 'message': 'Invalid credentials'})

    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))

    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')

        # Check if user exists
        if User.query.filter_by(email=email).first():
            return jsonify({'success': False, 'message': 'Email already exists'})

        if User.query.filter_by(username=username).first():
            return jsonify({'success': False, 'message': 'Username already exists'})

        # Create new user
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        user = User(username=username, email=email, password=hashed_password)
        db.session.add(user)
        db.session.commit()

        login_user(user)
        return jsonify({'success': True, 'message': 'Account created successfully'})

    return render_template('signup.html')

@app.route('/dashboard')
@login_required
def dashboard():
    ideas = Idea.query.filter_by(status='approved').order_by(Idea.created_at.desc()).all()
    return render_template('dashboard.html', ideas=ideas)

@app.route('/profile')
@login_required
def profile():
    return render_template('profile.html')

@app.route('/bookmarks')
@login_required
def bookmarks():
    bookmarked_ideas = db.session.query(Idea).join(Bookmark).filter(
        Bookmark.user_id == current_user.id
    ).all()
    return render_template('bookmarks.html', ideas=bookmarked_ideas)

@app.route('/settings')
@login_required
def settings():
    return render_template('settings.html')

@app.route('/admin')
@login_required
def admin():
    if current_user.role != 'admin':
        return redirect(url_for('dashboard'))
    return render_template('admin.html')

# API Routes
@app.route('/api/user')
@login_required
def get_user():
    return jsonify({
        'id': current_user.id,
        'username': current_user.username,
        'email': current_user.email,
        'role': current_user.role,
        'credits': current_user.credits,
        'avatar': current_user.avatar,
        'bio': current_user.bio,
        'linkedin': current_user.linkedin,
        'portfolio_pdf': current_user.portfolio_pdf,
        'created_at': current_user.created_at.isoformat(),
        'is_verified': current_user.is_verified
    })

@app.route('/api/user/bookmarks')
@login_required
def get_user_bookmarks():
    bookmarks = Bookmark.query.filter_by(user_id=current_user.id).all()
    bookmark_ids = [b.idea_id for b in bookmarks]
    return jsonify(bookmark_ids)

@app.route('/api/ideas', methods=['GET'])
@login_required
def get_ideas():
    filter_type = request.args.get('filter', 'all')
    sort_by = request.args.get('sort', 'newest')
    search = request.args.get('search', '')

    query = Idea.query.filter_by(status='approved')

    if filter_type == 'open-innovation':
        query = query.filter_by(is_verified=False)
    elif filter_type == 'verified-startups':
        query = query.filter_by(is_verified=True)

    if search:
        query = query.filter(
            db.or_(
                Idea.title.ilike(f'%{search}%'),
                Idea.description.ilike(f'%{search}%'),
                Idea.category.ilike(f'%{search}%')
            )
        )

    if sort_by == 'most-voted':
        query = query.order_by(Idea.upvotes.desc())
    elif sort_by == 'trending':
        query = query.order_by((Idea.upvotes + Idea.comments).desc())
    elif sort_by == 'oldest':
        query = query.order_by(Idea.created_at.asc())
    else:
        query = query.order_by(Idea.created_at.desc())

    ideas = query.all()
    return jsonify([{
        'id': idea.id,
        'title': idea.title,
        'description': idea.description,
        'category': idea.category,
        'author': idea.author.username,
        'author_avatar': idea.author.avatar,
        'created_at': idea.created_at.isoformat(),
        'upvotes': idea.upvotes,
        'downvotes': idea.downvotes,
        'comments': idea.comments,
        'is_verified': idea.author.is_verified,
        'allow_internships': idea.allow_internships,
        'skills_required': idea.skills_required,
        'status': idea.status
    } for idea in ideas])

@app.route('/api/vote', methods=['POST'])
@login_required
def vote():
    data = request.get_json()
    idea_id = data.get('idea_id')
    vote_type = data.get('vote_type')

    if not idea_id or vote_type not in ['upvote', 'downvote']:
        return jsonify({'success': False, 'message': 'Invalid data'})

    idea = Idea.query.get_or_404(idea_id)

    # Check if user already voted
    existing_vote = Vote.query.filter_by(user_id=current_user.id, idea_id=idea_id).first()

    if existing_vote:
        if existing_vote.vote_type == vote_type:
            # Remove vote
            db.session.delete(existing_vote)
            if vote_type == 'upvote':
                idea.upvotes -= 1
            else:
                idea.downvotes -= 1
        else:
            # Change vote
            if vote_type == 'upvote':
                idea.upvotes += 1
                idea.downvotes -= 1
            else:
                idea.upvotes -= 1
                idea.downvotes += 1
            existing_vote.vote_type = vote_type
    else:
        # New vote
        vote = Vote(vote_type=vote_type, user_id=current_user.id, idea_id=idea_id)
        db.session.add(vote)
        if vote_type == 'upvote':
            idea.upvotes += 1
        else:
            idea.downvotes += 1

        # Deduct credit
        current_user.credits -= 1

    db.session.commit()
    return jsonify({'success': True, 'message': 'Vote recorded'})

@app.route('/api/bookmark', methods=['POST'])
@login_required
def bookmark():
    data = request.get_json()
    idea_id = data.get('idea_id')

    if not idea_id:
        return jsonify({'success': False, 'message': 'Invalid data'})

    bookmark = Bookmark.query.filter_by(user_id=current_user.id, idea_id=idea_id).first()

    if bookmark:
        db.session.delete(bookmark)
        message = 'Bookmark removed'
    else:
        bookmark = Bookmark(user_id=current_user.id, idea_id=idea_id)
        db.session.add(bookmark)
        message = 'Bookmark added'

    db.session.commit()
    return jsonify({'success': True, 'message': message})

@app.route('/api/post-idea', methods=['POST'])
@login_required
def post_idea():
    title = request.form.get('title')
    description = request.form.get('description')
    category = request.form.get('category')
    allow_internships = request.form.get('allow_internships') == 'on'
    skills_required = request.form.get('skills_required', '')
    internship_description = request.form.get('internship_description', '')

    # Handle image upload
    image_filename = ''
    if 'image' in request.files:
        file = request.files['image']
        if file.filename:
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            image_filename = filename

    idea = Idea(
        title=title,
        description=description,
        category=category,
        image=image_filename,
        allow_internships=allow_internships,
        skills_required=skills_required,
        internship_description=internship_description,
        user_id=current_user.id
    )

    db.session.add(idea)
    db.session.commit()

    return jsonify({'success': True, 'message': 'Idea submitted successfully'})

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Create admin user if not exists
        admin = User.query.filter_by(role='admin').first()
        if not admin:
            hashed_password = bcrypt.generate_password_hash('admin123').decode('utf-8')
            admin = User(username='admin', email='admin@pitchdesk.com', password=hashed_password, role='admin', credits=999)
            db.session.add(admin)
            db.session.commit()

    if not os.path.exists('uploads'):
        os.makedirs('uploads')

    app.run(debug=True, host='0.0.0.0', port=5000)
