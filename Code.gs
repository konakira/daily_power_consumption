function myFunction() {
  const coefficient = 211;
  const cumulative_electric_energy_effective_digits = 215;
  const normal_direction_cumulative_electric_energy = 224;
  const cumulative_electric_energy_unit = 225;
  const reverse_direction_cumulative_electric_energy = 227;
  const measured_instantaneous = 231;
 
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Power Consumption'); // get the target sheet
  var rowdata = [];
  var props = {}, dates = {};

  var token = "access token for api.nature.global here";
  var url = 'https://api.nature.global/1/appliances'

  var options = {
    url: url,
    method: 'GET',
    headers: {
	'Authorization': 'Bearer ' + token,
    },
//    json: true
  }

  var response = UrlFetchApp.fetch(url, options); // do obtain the data.
  var body = JSON.parse(response.getContentText()); // parse the obtained data to retrieve values.
    
//  Logger.log(data);

  var data = body[0]["smart_meter"]["echonetlite_properties"];

  for (var item of data) {
    props[item["epc"]] = item["val"];
    dates[item["epc"]] = item["updated_at"];
  }
  // 係数等の処理
  props[normal_direction_cumulative_electric_energy] *= props[coefficient];
  props[reverse_direction_cumulative_electric_energy] *= props[coefficient];
  var cumulative_unit = props[cumulative_electric_energy_unit];
  if (0 < cumulative_unit) {
    if (9 < cumulative_unit) {
      for (var i = 9 ; i < cumulative_unit ; i++) {
        props[normal_direction_cumulative_electric_energy] *= 10;
        props[reverse_direction_cumulative_electric_energy] *= 10;
      }
    }
    else {
      for (var i = 0 ; i < cumulative_unit ; i++) {
        props[normal_direction_cumulative_electric_energy] /= 10;
        props[reverse_direction_cumulative_electric_energy] /= 10;
      }
    }
  }
  
  // 本当はNature remoクラウドから拾ってきた日付時刻を使いたいが、グリニッジタイムで記録されてて、どう変換したら良いか分からないのでパス。Nature remoには数分前のデータしかないけど、まあ良いや
  var date_str = dates[normal_direction_cumulative_electric_energy].replace('T', ' ').replace('Z', '');

  rowdata[0] = Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy-MM-dd");  
  rowdata[1] = props[normal_direction_cumulative_electric_energy];
  rowdata[2] = props[reverse_direction_cumulative_electric_energy];
//  rowdata[3] = rowdata[1] - rowdata[2];
  rowdata[3] = "=indirect(\"RC[-2]\", false)-indirect(\"RC[-1]\", false)";
  rowdata[4] = "=indirect(\"RC[-1]\", false)-indirect(\"R[-1]C[-1]\", false)";
  Logger.log(rowdata);
  
  sheet.appendRow(rowdata); // record the result to the google spreadsheet.

  /*
  // 正方向から逆方向を引いたものと、前日との差を式で挿入する。
  var lastRow = sheet.getLastRow();
  var formula;

  formula = "=B" + lastRow + "-C" + lastRow;
  sheet.getRange(lastRow, 4).setFormula(formula);
  formula = "=D" + lastRow + "-D" + (lastRow - 1);
  sheet.getRange(lastRow, 5).setFormula(formula);
  */
}
