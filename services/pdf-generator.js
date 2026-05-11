// pdf-generator.js
const fs = require('fs');
const path = require('path');
const PdfPrinter = require('pdfmake');

const fonts = {
  Roboto: {
    normal: path.join(__dirname, '../fonts/roboto/Roboto-Regular.ttf'),
    bold: path.join(__dirname, '../fonts/roboto/Roboto-Medium.ttf'),
    italics: path.join(__dirname, '../fonts/roboto/Roboto-MediumItalic.ttf'),
    bolditalics: path.join(__dirname, '../fonts/roboto/Roboto-MediumItalic.ttf')
  }
};
const logoPath = path.join(__dirname, '..', 'images', 'logo-homeren.png');
const logoBuffer = fs.readFileSync(logoPath);
const logoBase64 = 'data:image/png;base64,' + logoBuffer.toString('base64');

const printer = new PdfPrinter(fonts);

async function generatePdfMake(projectID, data) {
  const pdfPath = path.join(__dirname, '..', 'files', `details_des_devis_du_projet_${projectID}.pdf`);
    let travail_courrant=0;
    let total_ht_sum_devis=0;
  const docDefinition = {
    content: [

    { text: `Travaux de renovation de la maison de ${data.pseudo}`,fontSize: 13, bold: true,alignment: 'center',margin: [0, 20, 0, 10] },
    { text: `Détails des devis du projet ${projectID}`,fontSize: 15, bold: true,alignment: 'center',margin: [0, 10, 0, 30] },
    
        {
            table: {
            headerRows: 1,
            widths: ['*', 30, 60, 80, 80],
            body: [
              [
                { text: 'Désignation', bold: true },
                { text: 'U', bold: true },
                { text: 'Q', bold: true },
                { text: 'PU', bold: true },
                { text: 'Total', bold: true }
              ],
              

              ...data.devisList.flatMap((item, indexDevis) => {

                let blocDevis = [];
                let totalHTDevis = 0;

                //  Titre devis
                blocDevis.push([
                  {
                    text: `DEVIS #${item.ID}`,
                    colSpan: 5,
                    bold: true,
                    fillColor: '#ffffff',
                    alignment: 'center',
                    margin: [0, 5, 0, 5]
                  }, {}, {}, {}, {}
                ]);

                //  Tâches
                blocDevis.push(
                  ...item.DevisTaches.flatMap((tache) => {

                    let lignes = [];

                    let elementsRecap = (data.results[travail_courrant]?.elements_recap || []);

                    if (elementsRecap.length > 0) {
                      lignes.push(...elementsRecap.map(element => {
                        const total = parseFloat(element.total);
                        totalHTDevis += total;

                        return [
                          element.designation,
                          element.unite,
                          element.quantite,
                          `${parseFloat(element.prix_unitaire).toFixed(2)} €`,
                          `${total.toFixed(2)} €`
                        ];
                      }));
                    } else {
                      const prix = parseFloat(tache.Prix);
                      totalHTDevis += prix;

                      lignes.push([
                        '—',
                        '1',
                        '1',
                        `${prix.toFixed(2)} €`,
                        `${prix.toFixed(2)} €`
                      ]);
                    }

                    //  Ligne HT tâche uniquement
                    lignes.push([
                      { text: `${tache.Travail?.Titre || '—'} HT`, colSpan: 4, bold: true, fillColor: '#eeeeee' }, {}, {}, {},
                      { text: `${parseFloat(tache.Prix).toFixed(2)} €`, bold: true }
                    ]);

                    travail_courrant++;

                    return lignes;
                  })
                );

                //  Calculs devis
                const tva = item.Tva?.Valeur || 0;
                const montantTVA = totalHTDevis * (tva / 100);
                const totalTTC = totalHTDevis + montantTVA;

                total_ht_sum_devis += totalHTDevis

                //  Lignes récap devis
                blocDevis.push(
                  [
                    { text: `DEVIS #${item.ID} HT`, colSpan: 4, bold: true }, {}, {}, {},
                    { text: `${totalHTDevis.toFixed(2)} €`, bold: true }
                  ],
                  [
                    { text: `TVA (${tva}%)`, colSpan: 4, bold: true }, {}, {}, {},
                    { text: `${montantTVA.toFixed(2)} €`, bold: true }
                  ],
                  [
                    { text: `DEVIS #${item.ID} TTC`, colSpan: 4, bold: true, fillColor: '#dddddd' }, {}, {}, {},
                    { text: `${totalTTC.toFixed(2)} €`, bold: true, fillColor: '#dddddd' }
                  ]
                );

                return blocDevis;
              }),


              [
                { text: `RECAPITULATIF PROJET N°${projectID}`, colSpan: 4,bold: true, fillColor: '#FFC736', alignment: 'left', bold: true }, {}, {}, {},
                { text: `${data.prix_total.toFixed(2)} €`, bold: true, fillColor: '#FFC736', }
              ],

              ...data.devisList.flatMap((item, indexDevis) => {

                let blocRecapDevis = [];
                let totalHTDevis = 0;
                //  Tâches
                blocRecapDevis.push(
                  ...item.DevisTaches.flatMap((tache) => {

                    let lignes = [];

                    let elementsRecap = (data.results[travail_courrant]?.elements_recap || []);

                    if (elementsRecap.length > 0) {
                      lignes.push(...elementsRecap.map(element => {
                        const total = parseFloat(element.total);
                        totalHTDevis += total;
                      }));
                    } else {
                      const prix = parseFloat(tache.Prix);
                      totalHTDevis += prix;
                    }
                    travail_courrant++;

                    return lignes;
                  })
                );

                //  Calculs devis
                const tva = item.Tva?.Valeur || 0;
                const montantTVA = totalHTDevis * (tva / 100);
                const totalTTC = totalHTDevis + montantTVA;

            

                //  Lignes récap devis
                blocRecapDevis.push(
                  [
                    { text: `TOTAL HT DEVIS N°${item.ID}`, colSpan: 4, bold: true }, {}, {}, {},
                    { text: `${totalHTDevis.toFixed(2)} €`, bold: true }
                  ],
                  [
                    { text: `TVA (${tva}%)`, colSpan: 4, bold: true }, {}, {}, {},
                    { text: `${montantTVA.toFixed(2)} €`, bold: true }
                  ],
                );

                return blocRecapDevis;
              }),


              [
                { text: `TOTAL HT PROJET N°${projectID}`, colSpan: 4,bold: true, fillColor: '#FFC736', alignment: 'left', bold: true }, {}, {}, {},
                { text: `${total_ht_sum_devis.toFixed(2)} €`,  fillColor: '#FFC736', bold: true }
              ],
              ...data.devisList.flatMap((item, indexDevis) => {

                let blocRecapTVADevis = [];
                let totalHTDevis = 0;
                //  Tâches
                blocRecapTVADevis.push(
                  ...item.DevisTaches.flatMap((tache) => {

                    let lignes = [];

                    let elementsRecap = (data.results[travail_courrant]?.elements_recap || []);

                    if (elementsRecap.length > 0) {
                      lignes.push(...elementsRecap.map(element => {
                        const total = parseFloat(element.total);
                        totalHTDevis += total;
                      }));
                    } else {
                      const prix = parseFloat(tache.Prix);
                      totalHTDevis += prix;
                    }
                    travail_courrant++;

                    return lignes;
                  })
                );

                //  Calculs devis
                const tva = item.Tva?.Valeur || 0;
                const montantTVA = totalHTDevis * (tva / 100);
                const totalTTC = totalHTDevis + montantTVA;

           

                //  Lignes récap devis
                blocRecapTVADevis.push(
                  [
                    { text: `MONTANT TVA DEVIS #${item.ID} (${tva}%)`, colSpan: 4, bold: true }, {}, {}, {},
                    { text: `${montantTVA.toFixed(2)} €`, bold: true }
                  ],
                );

                return blocRecapTVADevis;
              }),
              [
                { text: `TOTAL TTC PROJET N°${projectID}`, colSpan: 4,bold: true, fillColor: '#FFC736', alignment: 'left', bold: true }, {}, {}, {},
                { text: `${data.prix_total.toFixed(2)} €`, bold: true, fillColor: '#FFC736',  }
              ]
            ]

            },
            layout: {
                hLineWidth: function(i) { return 1; },
                vLineWidth: function(i) { return 1; },
                hLineColor: function(i) { return '#cccccc'; },
                vLineColor: function(i) { return '#cccccc'; }
            }
        },
        { text: 'Acompte 30% à la commande, le solde par situation hebdomadaire.' ,margin: [0, 50, 0, 0] },
        { text: 'Le présent devis ne vaut que par ce qu\'il décrit.'  },
        { text: 'L\'entreprise presentera, suivant demande les informations techniques des produits utilisés.'  },
        { text: 'Les reglements s\'effectueront par virement hebdomadaire sur presentation des situations de travaux.'  },
        { text: 'Les delais d\'executions sont à définir d\'un commun accord avec le maitre d\'ouvrage.'  },
        { text: 'Accord client :' ,margin: [0, 30, 0, 0] },
        {
            margin: [0, 20, 0, 0], // marge en haut (20) pour aérer
            text: 'Je soussigné, ......................................................, donne mon accord au présent devis et accepte les conditions décrites ci-avant.'
        },
        {
            margin: [0, 5, 0, 20], // espace entre les deux paragraphes
            text: 'Fait le ...................................................... à ......................................................'
        }
    ],
     header: function(currentPage, pageCount) {
    if (currentPage > 1) {
        return ''; // Pas de header pour les pages suivantes
    }
    return {
      margin: [40, 40, 40, 0],
      columns: [
        {
          image: logoBase64,
          width: 100
        },
        // Espacement entre le logo et le texte
        {
            width: 150,
            text: ''
        },
        {
          stack: [
            { text: 'DATE', alignment: 'left', fontSize: 10, bold: true,  },
            { text: 'NOM CLIENT', alignment: 'left', fontSize: 10, bold: true, },
            { text: 'ADRESSE', alignment: 'left', fontSize: 10, bold: true, }
          ],
          width: 'auto'
        },
        {
            width: 50,
            text: ''
        },
        {
          stack: [
            { text: `${data.currentDate}`, alignment: 'left', fontSize: 10, bold: true, },
            { text: `${data.pseudo}`, alignment: 'left', fontSize: 10, bold: true, },
            { text: `${data.email_user}`, alignment: 'left', fontSize: 10, bold: true, }
          ],
          width: '*'
        }
      ]
    };
  },

  footer: function(currentPage, pageCount) {
    return {
    margin: [40, 0, 40, 30],
    alignment: 'center',
    fontSize: 8,
    italics: true,
    stack: [
      'Homeren SARL - capital 10 000€ - SIRET : 00000000000',
      '5 rue Charles de Gaulle - 75001 Paris',
      { text: `${currentPage} / ${pageCount}`, alignment: 'right', italics: false, fontSize: 8, margin: [0, 5, 0, 0] }
    ]
  };
  },
  pageMargins: [40, 140, 40, 60], // Adjust margins to accommodate header/footer
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(pdfPath);
    pdfDoc.pipe(writeStream);
    pdfDoc.end();
    writeStream.on('finish', () => resolve(pdfPath));
    writeStream.on('error', reject);
  });
}

module.exports = generatePdfMake;
