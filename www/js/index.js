var dialog = document.querySelector('dialog');
var global_name = '';
dialogPolyfill.registerDialog(dialog);
var str = '{"maps":[{"map_name":"e_coli_core.Core metabolism","organism":"Escherichia coli"},{"map_name":"iJO1366.Central metabolism","organism":"Escherichia coli"},{"map_name":"iJO1366.Fatty acid beta-oxidation","organism":"Escherichia coli"},{"map_name":"iJO1366.Fatty acid biosynthesis (saturated)","organism":"Escherichia coli"},{"map_name":"iJO1366.Nucleotide and histidine biosynthesis","organism":"Escherichia coli"},{"map_name":"iJO1366.Nucleotide metabolism","organism":"Escherichia coli"},{"map_name":"RECON1.Amino acid metabolism (partial)","organism":"Homo sapiens"},{"map_name":"RECON1.Carbohydrate metabolism","organism":"Homo sapiens"},{"map_name":"RECON1.Glycolysis TCA PPP","organism":"Homo sapiens"},{"map_name":"RECON1.Inositol retinol metabolism","organism":"Homo sapiens"},{"map_name":"RECON1.Tryptophan metabolism","organism":"Homo sapiens"}]}';
var indexJSON = eval("(" + str + ")");

$('.map_select').on('change',function(e){
  // creo los enlaces
  var map = $(this).val();
  var graph_url = 'http://cdn.rcsb.org/pathway/'+global_name+'/'+map+'/'+map+'.json';
  var info_url  = 'http://bigg.ucsd.edu/models/'+map.split('.')[0];
  console.log(graph_url);
  console.log(info_url);
  // creo los tres botones:  Show graph, Model Info, Publications
  $('#action_buttons').empty();
  $('#action_buttons').append('<button onclick="javascript:draw_map(\''+graph_url.toString()+'\');" style="margin-right: 5px;" class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored mdl-js-ripple-effect" data-upgraded=",MaterialButton,MaterialRipple">Graph<span class="mdl-button__ripple-container"><span class="mdl-ripple"></span></span></button>');
  $('#action_buttons').append('<button onclick="javascript:show_info(\''+info_url.toString()+'\');" id="graph" style="margin-right: 5px;" class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored mdl-js-ripple-effect" data-upgraded=",MaterialButton,MaterialRipple">Model Info<span class="mdl-button__ripple-container"><span class="mdl-ripple"></span></span></button>');
  $('#action_buttons').append('<button onclick="javascript:show_pubs(\''+global_name.split('.')[0]+'\');" id="graph" style="margin-right: 5px;" class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored mdl-js-ripple-effect" data-upgraded=",MaterialButton,MaterialRipple">Publications<span class="mdl-button__ripple-container"><span class="mdl-ripple"></span></span></button>');

  //draw_map(url);
});
function draw_map(url){
  window.location.href = "www1/index.html?url="+url;
}
function show_info(url){
  window.location.href = "www1/model_info.html?url="+url;
}
function show_pubs(term){
  window.location.href = "www1/publications.html?term="+term;
  //https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&retmax=50&term=escherichia+coli[title]
  //https://www.ncbi.nlm.nih.gov/pubmed/27905793?report=xml&format=text
}
function loadGraph(prot_id){
  $('#loading').fadeIn();
  var graph_div = document.getElementById('graph_div');
  var instance = new ProtVista({
    el: graph_div,
    uniprotacc: prot_id
  });
  instance.getDispatcher().on("ready", function(obj) {
      setTimeout(function () {
          $('#page-1').hide();
          $('#page-2').fadeIn();
          $('#loading').hide();
      }, 1000);
  });
}

function loadPublications(prot_id){
    var url = 'http://www.uniprot.org/uniprot/'+prot_id+'.xml';
    $.get(url, function(data, status){
        var seq = $(data).find('sequence').text();
        $('#sequence').text('');
        $('#sequence').text(seq.replace(/(.{10})/g,"$1  "));
        var cont = 1;
        $.each($(data).find('reference'), function () {
            var title = $(this).find('title').text();
            if(title !== ''){
              var pubMedID = $($(this).find('dbReference')[0]).prop('id');
              var pubMedURL = 'https://www.ncbi.nlm.nih.gov/pubmed/'+pubMedID;
              $('#pub_table').append('<tr><td><strong>'+cont+'</strong> - <a href="'+pubMedURL+'">'+title+'</a></td></tr>');
              cont++;
            }
        });
    }, 'xml');
}

$('#close_error').on('click',function(){
  dialog.close();
});
$('.nz_ex_btn').on('click', function(e){
    var p_id = $(this).text();
    $('#protein_id').focus();
    $('#protein_id')[0].parentElement.MaterialTextfield.change(p_id);
});
$('.nz_back_btn').on('click',function(e){
    $('#protein_id').val('');
    $('#page-2').hide();
    $('#page-1').fadeIn();
});
$('.nz_back_btn_2').on('click',function(e){
    $('#page-3').hide();
    $('#page-2').fadeIn();
});
$('.nz_back_btn_3').on('click',function(e){
    $('#page-4').hide();
    $('#page-2').fadeIn();
});
$('.nz_plus_btn').on('click', function(){
    $('#extra_info_p2').fadeToggle();
});
$('.nz_plus_btn_p3').on('click', function(){
    $('#extra_info_p3').fadeToggle();
});
$('.nz_plus_btn_p4').on('click', function(){
    $('#extra_info_p4').fadeToggle();
});
$('.nz_pubs').on('click', function(e) {
  $('#page-2').hide();
  $('#page-4').hide();
  $('#page-3').fadeIn();
});
$('.nz_seq').on('click', function(e) {
  $('#page-2').hide();
  $('#page-3').hide();
  $('#page-4').fadeIn();
});
function copyToClipboard(elementId) {
  var aux = document.createElement("input");
  aux.setAttribute("value", document.getElementById(elementId).innerHTML);
  document.body.appendChild(aux);
  aux.select();
  document.execCommand("copy");
  document.body.removeChild(aux);
  var snackbarContainer = document.querySelector('#toast');
  var data = {message: 'Text has been copied to clipboard.'};
  snackbarContainer.MaterialSnackbar.showSnackbar(data);
}
$('#search').on('click', function(e){
  var name = $('#protein_id').val();
  if( name == ''){
    show_error('The textbox is empty, please insert the organism name.');
  }else{
    if(verify_organism(name)){
      load_maps_select(name);
    }else{show_error('Organism not found in the database.');}
  }
});
function load_maps_select(name){
  global_name = name;
  $('.map_select').empty();
  var maps = {}
  var str = '{"maps":[{"map_name":"e_coli_core.Core metabolism","organism":"Escherichia coli"},{"map_name":"iJO1366.Central metabolism","organism":"Escherichia coli"},{"map_name":"iJO1366.Fatty acid beta-oxidation","organism":"Escherichia coli"},{"map_name":"iJO1366.Fatty acid biosynthesis (saturated)","organism":"Escherichia coli"},{"map_name":"iJO1366.Nucleotide and histidine biosynthesis","organism":"Escherichia coli"},{"map_name":"iJO1366.Nucleotide metabolism","organism":"Escherichia coli"},{"map_name":"RECON1.Amino acid metabolism (partial)","organism":"Homo sapiens"},{"map_name":"RECON1.Carbohydrate metabolism","organism":"Homo sapiens"},{"map_name":"RECON1.Glycolysis TCA PPP","organism":"Homo sapiens"},{"map_name":"RECON1.Inositol retinol metabolism","organism":"Homo sapiens"},{"map_name":"RECON1.Tryptophan metabolism","organism":"Homo sapiens"}]}';
  var indexJSON = eval("(" + str + ")");
  [indexJSON].filter(function(x) { return x !== null; }).forEach(function(i) {
      ['maps'].forEach(function(n) {
          i[n].forEach(function(m) {
              if(m.organism == name){
                maps[m.map_name] = true;
              }
          });
      });
  });
  maps = Object.keys(maps);
  $('.map_select').append('<option value="">Select a map to render</option>');
  for (var i = 0; i < maps.length; i++) {
    var map_name = maps[i];
    console.log(map_name);
    $('.map_select').append('<option value="'+map_name+'">'+map_name+'</option>');
    $('.map_select').fadeIn();
  }
}
function verify_organism(name){
  var name_exists = false;
  [indexJSON].filter(function(x) { return x !== null; }).forEach(function(i) {
      ['maps'].forEach(function(n) {
          i[n].forEach(function(m) {
            if(m.organism === name){
                name_exists = true;
            }
          });
      });
  });
  return name_exists;
}
function show_error(msg){
  $('#error_text').text(msg);
  dialog.showModal();
}
