#!/bin/bash

# =============================================================================
# Script d'installation automatique - IPF Backend API
# =============================================================================
# Usage: ./scripts/setup-dev.sh
# =============================================================================

set -e  # Arrêter en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions utilitaires
print_step() {
    echo -e "\n${BLUE}==>${NC} ${1}"
}

print_success() {
    echo -e "${GREEN}✓${NC} ${1}"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} ${1}"
}

print_error() {
    echo -e "${RED}✗${NC} ${1}"
}

# Vérifier si une commande existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# =============================================================================
# Vérification des prérequis
# =============================================================================

print_step "Vérification des prérequis..."

# Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_success "Node.js installé: $NODE_VERSION"
else
    print_error "Node.js n'est pas installé!"
    echo "Installez Node.js 20 LTS avec:"
    echo "  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
    echo "  sudo apt install -y nodejs"
    exit 1
fi

# npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_success "npm installé: $NPM_VERSION"
else
    print_error "npm n'est pas installé!"
    exit 1
fi

# Docker (optionnel)
if command_exists docker; then
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | tr -d ',')
    print_success "Docker installé: $DOCKER_VERSION"
    USE_DOCKER=true
else
    print_warning "Docker n'est pas installé (optionnel)"
    USE_DOCKER=false
fi

# =============================================================================
# Choix du mode d'installation
# =============================================================================

echo ""
echo "Comment voulez-vous installer PostgreSQL et Redis?"
echo "  1) Docker (recommandé si Docker est installé)"
echo "  2) Installation locale (apt)"
echo ""

if [ "$USE_DOCKER" = true ]; then
    read -p "Choix [1]: " INSTALL_MODE
    INSTALL_MODE=${INSTALL_MODE:-1}
else
    read -p "Choix [2]: " INSTALL_MODE
    INSTALL_MODE=${INSTALL_MODE:-2}
fi

# =============================================================================
# Installation des services
# =============================================================================

if [ "$INSTALL_MODE" = "1" ]; then
    print_step "Démarrage des services avec Docker..."
    
    if [ -f "docker-compose.yml" ]; then
        docker-compose up -d
        print_success "PostgreSQL et Redis démarrés avec Docker"
        
        # Attendre que les services soient prêts
        echo "Attente du démarrage des services..."
        sleep 5
        
        # Vérifier PostgreSQL
        until docker exec ipf-postgres pg_isready -U ipf_admin -d ipf_db > /dev/null 2>&1; do
            echo "  En attente de PostgreSQL..."
            sleep 2
        done
        print_success "PostgreSQL prêt"
        
        # Vérifier Redis
        until docker exec ipf-redis redis-cli ping > /dev/null 2>&1; do
            echo "  En attente de Redis..."
            sleep 2
        done
        print_success "Redis prêt"
        
        # Configuration de DATABASE_URL pour Docker
        DB_URL="postgresql://ipf_admin:dev_password_123@localhost:5432/ipf_db"
    else
        print_error "docker-compose.yml non trouvé!"
        exit 1
    fi
else
    print_step "Vérification de PostgreSQL local..."
    
    if command_exists psql; then
        print_success "PostgreSQL est installé"
    else
        print_warning "PostgreSQL n'est pas installé. Installation..."
        sudo apt update
        sudo apt install -y postgresql postgresql-contrib
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
        print_success "PostgreSQL installé et démarré"
    fi
    
    print_step "Vérification de Redis local..."
    
    if command_exists redis-cli; then
        print_success "Redis est installé"
    else
        print_warning "Redis n'est pas installé. Installation..."
        sudo apt install -y redis-server
        sudo systemctl start redis-server
        sudo systemctl enable redis-server
        print_success "Redis installé et démarré"
    fi
    
    # Configuration de la base de données
    print_step "Configuration de la base de données PostgreSQL..."
    
    read -sp "Entrez le mot de passe pour l'utilisateur ipf_admin: " DB_PASSWORD
    echo ""
    
    sudo -u postgres psql << EOF
DO \$\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'ipf_admin') THEN
      CREATE USER ipf_admin WITH PASSWORD '${DB_PASSWORD}';
   END IF;
END
\$\$;

ALTER USER ipf_admin CREATEDB;

SELECT 'CREATE DATABASE ipf_db OWNER ipf_admin'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ipf_db')\gexec

GRANT ALL PRIVILEGES ON DATABASE ipf_db TO ipf_admin;
EOF

    sudo -u postgres psql -d ipf_db << EOF
GRANT ALL ON SCHEMA public TO ipf_admin;
ALTER SCHEMA public OWNER TO ipf_admin;
EOF

    print_success "Base de données configurée"
    
    DB_URL="postgresql://ipf_admin:${DB_PASSWORD}@localhost:5432/ipf_db"
fi

# =============================================================================
# Configuration du fichier .env
# =============================================================================

print_step "Configuration du fichier .env..."

if [ -f ".env" ]; then
    print_warning "Le fichier .env existe déjà"
    read -p "Voulez-vous le remplacer? (o/N): " REPLACE_ENV
    if [ "$REPLACE_ENV" != "o" ] && [ "$REPLACE_ENV" != "O" ]; then
        print_success "Conservation du fichier .env existant"
    else
        CREATE_ENV=true
    fi
else
    CREATE_ENV=true
fi

if [ "$CREATE_ENV" = true ]; then
    cat > .env << EOF
# Auth0 Configuration
# Demandez ces valeurs au lead dev
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://api.ipf.com

# Application
PORT=3000
NODE_ENV=development

# Database PostgreSQL
DATABASE_URL="${DB_URL}"

# Redis (pour le cache)
REDIS_HOST=localhost
REDIS_PORT=6379
EOF

    print_success "Fichier .env créé"
    print_warning "N'oubliez pas de configurer AUTH0_DOMAIN et AUTH0_AUDIENCE!"
fi

# =============================================================================
# Installation des dépendances npm
# =============================================================================

print_step "Installation des dépendances npm..."
npm install
print_success "Dépendances installées"

# =============================================================================
# Configuration de Prisma
# =============================================================================

print_step "Configuration de Prisma..."

# Générer le client Prisma
npx prisma generate
print_success "Client Prisma généré"

# Appliquer les migrations
print_step "Application des migrations Prisma..."
npx prisma migrate deploy || npx prisma migrate dev --name init
print_success "Migrations appliquées"

# =============================================================================
# Résumé
# =============================================================================

echo ""
echo "=============================================="
echo -e "${GREEN}Installation terminée avec succès!${NC}"
echo "=============================================="
echo ""
echo "Pour démarrer l'API:"
echo "  npm run start:dev"
echo ""
echo "L'API sera disponible sur:"
echo "  - API: http://localhost:3000/api"
echo "  - Swagger: http://localhost:3000/api/docs"
echo ""
echo "Outils utiles:"
echo "  - Prisma Studio: npx prisma studio"
if [ "$INSTALL_MODE" = "1" ]; then
echo "  - Logs Docker: docker-compose logs -f"
echo "  - Arrêter Docker: docker-compose down"
fi
echo ""
echo -e "${YELLOW}⚠ N'oubliez pas de configurer AUTH0_DOMAIN et AUTH0_AUDIENCE dans .env${NC}"
echo ""
