import { useState } from 'react'
import './ExpertiseQuestionnaire.css'

const ExpertiseQuestionnaire = ({ expertiseLevel, onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({})

  const questions = {
    'Intermédiaire': [
      {
        id: 1,
        question: 'Quels outils d\'analyse de données utilisez-vous régulièrement ?',
        type: 'multiple',
        options: ['Excel', 'Python', 'R', 'SQL', 'Power BI', 'Tableau', 'Google Analytics', 'Autre'],
        required: true
      },
      {
        id: 2,
        question: 'Depuis combien de temps pratiquez-vous l\'analyse de données ?',
        type: 'single',
        options: ['Moins de 6 mois', '6 mois - 1 an', '1-2 ans', '2-3 ans', 'Plus de 3 ans'],
        required: true
      },
      {
        id: 3,
        question: 'Quel type d\'analyses avez-vous déjà réalisées ?',
        type: 'multiple',
        options: ['Analyse descriptive', 'Analyse exploratoire', 'Visualisation de données', 'Rapports business', 'Prédictions basiques', 'Aucune'],
        required: true
      }
    ],
    'Avancé': [
      {
        id: 1,
        question: 'Quelles technologies maîtrisez-vous en profondeur ?',
        type: 'multiple',
        options: ['Python (Pandas, NumPy, Scikit-learn)', 'R (Tidyverse, Shiny)', 'SQL avancé', 'Machine Learning', 'Deep Learning', 'Big Data (Spark, Hadoop)', 'Cloud (AWS, Azure, GCP)', 'Autre'],
        required: true
      },
      {
        id: 2,
        question: 'Combien d\'années d\'expérience avez-vous en analyse de données ?',
        type: 'single',
        options: ['2-3 ans', '3-5 ans', '5-7 ans', 'Plus de 7 ans'],
        required: true
      },
      {
        id: 3,
        question: 'Avez-vous déjà formé ou coaché d\'autres personnes en analyse de données ?',
        type: 'single',
        options: ['Oui, régulièrement', 'Oui, occasionnellement', 'Non, mais je suis prêt', 'Non'],
        required: true
      },
      {
        id: 4,
        question: 'Quels types de projets complexes avez-vous réalisés ?',
        type: 'multiple',
        options: ['Modèles de prédiction', 'Systèmes de recommandation', 'Analyse de séries temporelles', 'NLP / Text Mining', 'Computer Vision', 'Projets Big Data', 'Autre'],
        required: true
      }
    ],
    'Expert': [
      {
        id: 1,
        question: 'Quelles sont vos expertises principales ?',
        type: 'multiple',
        options: ['Data Science', 'Machine Learning / Deep Learning', 'Big Data & Cloud', 'Business Intelligence', 'Data Engineering', 'Statistiques avancées', 'Recherche académique', 'Autre'],
        required: true
      },
      {
        id: 2,
        question: 'Combien d\'années d\'expérience professionnelle avez-vous ?',
        type: 'single',
        options: ['5-7 ans', '7-10 ans', '10-15 ans', 'Plus de 15 ans'],
        required: true
      },
      {
        id: 3,
        question: 'Avez-vous de l\'expérience en mentorat ou formation ?',
        type: 'single',
        options: ['Oui, j\'ai formé plusieurs personnes', 'Oui, j\'ai une expérience significative', 'Oui, occasionnellement', 'Non, mais je suis intéressé'],
        required: true
      },
      {
        id: 4,
        question: 'Quels sont vos domaines d\'expertise spécifiques ?',
        type: 'multiple',
        options: ['Machine Learning avancé', 'Deep Learning', 'Big Data & Distributed Systems', 'Data Architecture', 'MLOps & Production', 'Recherche & Publications', 'Consulting stratégique', 'Autre'],
        required: true
      },
      {
        id: 5,
        question: 'Souhaitez-vous apparaître comme mentor sur la page Coaching ?',
        type: 'single',
        options: ['Oui, absolument', 'Oui, avec plaisir', 'Peut-être plus tard', 'Non'],
        required: true
      }
    ]
  }

  const currentQuestions = questions[expertiseLevel] || []
  const currentQuestion = currentQuestions[currentStep]
  const isLastStep = currentStep === currentQuestions.length - 1
  const isFirstStep = currentStep === 0

  const handleAnswer = (value) => {
    if (currentQuestion.type === 'multiple') {
      const currentAnswers = answers[currentQuestion.id] || []
      const newAnswers = currentAnswers.includes(value)
        ? currentAnswers.filter(a => a !== value)
        : [...currentAnswers, value]
      setAnswers({ ...answers, [currentQuestion.id]: newAnswers })
    } else {
      setAnswers({ ...answers, [currentQuestion.id]: value })
    }
  }

  const handleNext = () => {
    if (!answers[currentQuestion.id] || 
        (Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].length === 0)) {
      alert('Veuillez répondre à cette question avant de continuer')
      return
    }

    if (isLastStep) {
      handleComplete()
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    // Validate all required questions
    const allAnswered = currentQuestions.every(q => {
      const answer = answers[q.id]
      return answer && (Array.isArray(answer) ? answer.length > 0 : true)
    })

    if (!allAnswered) {
      alert('Veuillez répondre à toutes les questions')
      return
    }

    onComplete(answers)
  }

  const getProgress = () => {
    return ((currentStep + 1) / currentQuestions.length) * 100
  }

  if (currentQuestions.length === 0) {
    return null
  }

  return (
    <div className="questionnaire-overlay">
      <div className="questionnaire-modal">
        <div className="questionnaire-header">
          <div className="questionnaire-title">
            <h2>Questionnaire de compétences</h2>
            <p>Niveau {expertiseLevel} - {currentStep + 1} sur {currentQuestions.length}</p>
          </div>
          <button 
            className="questionnaire-close"
            onClick={onCancel}
            aria-label="Fermer"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="questionnaire-progress">
          <div 
            className="questionnaire-progress-bar"
            style={{ width: `${getProgress()}%` }}
          />
        </div>

        <div className="questionnaire-content">
          <div className="questionnaire-question">
            <h3>{currentQuestion.question}</h3>
            {currentQuestion.type === 'multiple' && (
              <p className="question-hint">Sélectionnez une ou plusieurs réponses</p>
            )}
          </div>

          <div className="questionnaire-options">
            {currentQuestion.options.map((option, index) => {
              const isSelected = currentQuestion.type === 'multiple'
                ? (answers[currentQuestion.id] || []).includes(option)
                : answers[currentQuestion.id] === option

              return (
                <button
                  key={index}
                  className={`questionnaire-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleAnswer(option)}
                  type="button"
                >
                  <div className="option-checkbox">
                    {isSelected && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span>{option}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="questionnaire-footer">
          <button
            className="btn btn-secondary"
            onClick={isFirstStep ? onCancel : handlePrevious}
            type="button"
          >
            {isFirstStep ? 'Annuler' : 'Précédent'}
          </button>
          <button
            className="btn btn-primary"
            onClick={handleNext}
            type="button"
          >
            {isLastStep ? 'Terminer' : 'Suivant'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExpertiseQuestionnaire

