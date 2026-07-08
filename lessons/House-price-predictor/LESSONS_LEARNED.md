# Lessons Learned — House Price Predictor
**Build #6 | Python (ML) | Data & Analytics | 2026-06-12**

---

## What Worked Well

- **Selectable models** (Linear Regression, Ridge, Random Forest, Gradient Boosting): Letting the user compare model performance side-by-side made this educational rather than just a one-shot script. The difference in RMSE between a linear model and a gradient boosted tree on the California dataset is dramatic and immediately informative.
- **Model cards**: Generating a markdown model card for each trained model (training data size, feature importances, evaluation metrics, limitations) was a practice worth bringing to every ML project. It makes the model's behavior explainable.
- **Batch validation mode**: Testing the model against a held-out validation set with a structured report (RMSE, MAE, R², residual plots) gave confidence in generalization, not just training performance.
- **Streamlit UI for live prediction**: Sliders for bedrooms, bathrooms, square footage, location gave a tactile sense of what the model had learned. Non-technical users could explore predictions without touching Python.

## Challenges Overcome

- **Feature engineering for location**: Raw latitude/longitude performed poorly. Binning into region clusters and adding proximity-to-coast features improved R² meaningfully. Learned that domain knowledge in feature engineering often matters more than model choice.
- **Overfitting on small feature sets**: The linear model overfit when polynomial features were added without regularization. Ridge regression with cross-validated `alpha` solved this.
- **Streamlit widget state on model reload**: When the user switched models in the Streamlit UI, predictions didn't update correctly until `st.session_state` was used to manage the loaded model explicitly.
- **Pickle security**: Initial approach used `pickle` for model serialization. Switched to `joblib` which is safer for numpy arrays and sklearn objects, and documented the security implications of loading arbitrary pickle files.

## Key Insights

- Always establish a baseline (median-of-training-set prediction) before building any model. Your model needs to beat that to be worth anything.
- Feature importance from Random Forest is a fast way to identify which engineered features are actually contributing — it exposed that two hand-crafted features I thought were clever were contributing almost nothing.
- The California housing dataset has well-known quirks (capped values, geographic outliers) — working with a "clean" toy dataset teaches less than working with one that has real issues.

## Next Time

- Use `scikit-learn` pipelines (`Pipeline`) from the start to chain preprocessing and model steps — it prevents data leakage and makes serialization/deployment cleaner.
- Add SHAP values for per-prediction explanations rather than just global feature importance.
- Try a neural network baseline with PyTorch to compare with tree-based models on the same dataset.
- Version models with MLflow rather than saving named joblib files.

## Skills Gained

- `scikit-learn`: pipelines, cross-validation, model selection, evaluation metrics
- Feature engineering for geospatial data
- `joblib` model serialization
- Model card authoring and ML documentation practices
- Streamlit session state management

## Integration Points

- The Streamlit UI pattern was directly reused from **Sales Dashboard (Build #3)** — this was the second Streamlit project and the UI structure became a template.
- Batch validation reporting informed the structured output design in **SQL Analytics Library (Build #24)**.
- The model card documentation practice connects to the portfolio documentation work in **Portfolio Site (Build #26)**.
