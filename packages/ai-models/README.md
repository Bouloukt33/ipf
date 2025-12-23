# AI Models - Python/FastAPI

Microservice IA pour le coaching personnalisé "5 Secondes Chrono".

## Stack Technique

- **Python 3.11+**
- **FastAPI** - API REST
- **TensorFlow / PyTorch** - Machine Learning
- **spaCy** - NLP (traitement langage)
- **Scikit-learn** - Algorithmes ML classiques
- **Redis** - Cache prédictions
- **Docker** - Conteneurisation

## Fonctionnalités

### 1. Analyse Comportementale
- Analyse historique des réponses
- Temps de réponse moyen
- Patterns d'erreurs récurrentes
- Fréquence d'utilisation

### 2. Profils d'Apprenants
```python
LEARNER_PROFILES = {
    "rapide_imprecis": "Motivé mais fait des erreurs",
    "lent_rigoureux": "Hésitant mais précis",
    "decrocheur": "Risque d'abandon",
    "progressant": "Amélioration constante",
    "expert": "Maîtrise confirmée"
}
```

### 3. Recommandations IA
- Suggestions de vidéos ciblées
- Quiz de remédiation
- Messages de coaching personnalisés
- Parcours adaptatifs

### 4. Coach Virtuel
- Interactions temps réel
- Encouragements contextuels
- Alertes sur erreurs fréquentes
- Prédictions de blocage

## Endpoints API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | /predict/profile | Prédire profil apprenant |
| POST | /recommend/videos | Recommander vidéos |
| POST | /recommend/quiz | Recommander quiz |
| POST | /coaching/message | Générer message coach |
| GET | /analytics/user/{id} | Analytics utilisateur |

## Scripts

```bash
# Environnement virtuel
python -m venv venv
source venv/bin/activate

# Installation
pip install -r requirements.txt

# Développement
uvicorn main:app --reload

# Tests
pytest

# Docker
docker build -t ipf-ai .
docker run -p 8001:8001 ipf-ai
```
