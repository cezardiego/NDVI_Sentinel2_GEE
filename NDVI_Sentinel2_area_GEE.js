//=================================================================================================
//         PORTUGUESE: CÓDIGO PARA OBTENÇÃO DE NDVI MÉDIO EM UMA ÁREA (via SENTINEL-2)
//=================================================================================================

//**********Alterar apenas os campos de Geometria (geometry) e Data (.filterDate)************
//************A imagem gerada pode ser exportada para o GDrive na aba 'Tasks'****************

// Importar área de interesse:
var geometry = ee.FeatureCollection('users/diego/tapacura')
var empty = ee.Image().byte();
var outline = empty.paint({
  featureCollection: geometry,
  color: 1,
  width: 2
});
Map.addLayer(outline, {palette: '#000000'}, 'Area',1);
Map.centerObject(geometry)

// Selecionar a coleção de imagens do S2:
var S2 = ee.ImageCollection('COPERNICUS/S2')
// Filtrar data inicial e final:
.filterDate('2020-01-01', '2020-12-31')
// Filtrar de acordo com a geometria (shape) de interesse:
.filterBounds(geometry);
// Função para mascarar nuvens de acordo com dados disponíveis na coleção S2:
// Informação sobre nuvens
var maskcloud1 = function(image) {
var QA60 = image.select(['QA60']);
return image.updateMask(QA60.lt(1));
};
// Função para calcular e adicionar uma banda NDVI:
var addNDVI = function(image) {
return image.addBands(image.normalizedDifference(['B8', 'B4']));
};
// Adicionar banda de NDVI à coleção de imagens:
var S2 = S2.map(addNDVI);
// Extract NDVI band and create NDVI median composite image
var NDVI = S2.select(['nd']);
var NDVImed = NDVI.median();

// Criar paletas para exibição de NDVI:
var ndvi_pal = ['#640000', '#ff0000', '#ffff00', '	#00c800', '#006400'];
// Mostrar resultados de NDVI no mapa:
Map.addLayer(NDVImed.clip(geometry), {min:-0.5, max:0.8, palette: ndvi_pal}, 'NDVI');

// Exportar imagem:
Export.image.toDrive({
  image: NDVI,
  region: geometry.geometry().getInfo(),
  description: 'NDVI_S2_Medio',
  scale: 10,
  maxPixels: 10E11,
  fileFormat: 'GeoTIFF',
});