const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');

const Page = sequelize.define('Page', {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'ID'
  },
  Titre: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'Titre'
  },
  Url: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'Url'
  },
  Content_balise_title: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'Content_balise_title'
  },
  Content_balise_description: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'Content_balise_description'
  },
  Content_balise_keywords: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'Content_balise_keywords'
  },
  Content_balise_robots: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'Content_balise_robots'
  },
  Href_balise_canonical: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'Href_balise_canonical'
  },
  Content_balise_og_title: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'Content_balise_og_title'
  },
  Content_balise_og_description: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'Content_balise_og_description'
  },
  Content_balise_og_url: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'Content_balise_og_url'
  },
  Content_balise_og_type: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'Content_balise_og_type'
  },
  Content_balise_og_image: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'Content_balise_og_image'
  },
  Content_balise_og_site_name: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'Content_balise_og_site_name'
  }
}, {
  tableName: 'Page',
  timestamps: false,
  underscored: true,
  charset: 'latin1',
  collate: 'latin1_swedish_ci'
});

module.exports = Page;