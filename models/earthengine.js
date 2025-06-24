// var table

var rainfallCollection = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY');

var withFeatures = table.map(function(feature) {
  var date = ee.Date(feature.get('date'));
  var geom = feature.geometry();
  var buffered = geom.buffer(300).bounds();  // ~300 meters

var vnpNDVI = ee.ImageCollection("NASA/VIIRS/002/VNP13A1")
  .select('NDVI')
  .filterDate(date.advance(-16, 'day'), date.advance(16, 'day'));

var ndviVal = ee.Algorithms.If(
  vnpNDVI.size().gt(0),
  vnpNDVI.mosaic()
    .multiply(0.0001)  // NDVI is scaled by 10000
    .unmask(ee.Image.constant(0.3))
    .reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: buffered,
      scale: 500,  // native resolution of VIIRS NDVI
      bestEffort: true
    }).get('NDVI'),
  null
);

  // Rainfall (past 7 days)
  var rainSubset = rainfallCollection
    .filterDate(date.advance(-7, 'day'), date);

  var rainVal = ee.Algorithms.If(
    rainSubset.size().gt(0),
    rainSubset.sum()
      .reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: buffered,
        scale: 5000,
        bestEffort: true
      }).get('precipitation'),
    null
  );

var lstCollection = ee.ImageCollection("MODIS/061/MOD11A1")
.select("LST_Day_1km")
.filterDate(date.advance(-2, 'day'), date.advance(1, 'day'));

var tempVal = ee.Algorithms.If(
  lstCollection.size().gt(0),
  lstCollection.mosaic()
    .multiply(0.02)
    .unmask(ee.Image.constant(300))
    .reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: buffered,
      scale: 1000,
      bestEffort: true
    }).get('LST_Day_1km'),
  null
);


  // Attach features to point
  return feature.set({
    'ndvi': ndviVal,
    'rainfall': rainVal,
    'temperature': tempVal
  });
});

Export.table.toDrive({
  collection: withFeatures,
  description: 'fire_train',
  folder: 'earthengine',
  fileFormat: 'CSV'
});
