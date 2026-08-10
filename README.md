Génération d'une population d'individus pour les Travaux pratiques sur les graphes

## Structure

### Nœuds

Person — un individu (propriétaire, emprunteur, prêteur)
Library — une bibliothèque personnelle
Book — l'œuvre (le titre, indépendant du support physique)
Author — un auteur
Genre — un genre littéraire
Copy — l'exemplaire physique, l'objet qui circule réellement
Loan — un événement de prêt (nœud, pas une simple relation, j'explique pourquoi plus bas)

### Relations

Relations

(:Author)-[:WRITE]->(:Book)
(:Book)-[:CLASSIFY-AS]->(:Genre)
(:Book)-[:PARTS-OF]->(:Serie)

(:Copy)-[:COPY-OF]->(:Book)
(:Library)-[:CONTAIN]->(:Copy)
(:Person)-[:MANAGE]->(:Library)

(:Person)-[:HOLD]->(:Copy)
(:Loan)-[:CONCERN]->(:Copy)
(:Person)-[:LEND]->(:Loan)
(:Person)-[:BORROW]->(:Loan)
(:Loan)-[:FOLLOW]->(:Loan)