var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var organizationSchema = mongoose.Schema({
  name: String,
  adminEmail: { type: String, required: true },
  slug: { type : String, unique: true },
  dbUrl: { type: String, unique: true, required: true }
}, {timestamps: true});

organizationSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = slugify(this.name);
  }
  return next();
});

organizationSchema.plugin(deepPopulate);

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}
  

module.exports = mongoose.model('Organization', organizationSchema);