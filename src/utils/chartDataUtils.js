export const processChartData = (sub_data) => {
  const labels = ['Low', 'Low-med', 'High-med', 'High'];
  
  // Extract PA and not_PA arrays
  const area_PA = sub_data?.area_km2_by_bin_in_PA || [];
  const area_not_PA = sub_data?.area_km2_by_bin_not_in_PA || [];

  const sum_PA = area_PA.reduce((sum, val) => sum + val, 0);
  const sum_not_PA = area_not_PA.reduce((sum, val) => sum + val, 0);
  
  const area_PA_frac = area_PA.map(val => sum_PA > 0 ? (val / sum_PA) * 100 : 0);
  const area_not_PA_frac = area_not_PA.map(val => sum_not_PA > 0 ? (val / sum_not_PA) * 100 : 0);
  
  // Construct transposed stacked data
  let chartData_areas_transposed = [];
  if (area_PA_frac.length === labels.length && area_not_PA_frac.length === labels.length) {
    chartData_areas_transposed = [
      {
        label: 'Unprotected',
        Low: area_not_PA_frac[0],
        'Low-med': area_not_PA_frac[1],
        'High-med': area_not_PA_frac[2],
        High: area_not_PA_frac[3]
      },
      {
        label: 'Protected',
        Low: area_PA_frac[0],
        'Low-med': area_PA_frac[1],
        'High-med': area_PA_frac[2],
        High: area_PA_frac[3]
      }
    ];
  }

  // Process land use data
  let chartData_landuse = [];
  
  if (sub_data?.area_km2_by_landuse_and_bin) {
    const landuse_data = sub_data.area_km2_by_landuse_and_bin;
    
    const category_sums = {};
    let total_sum = 0;
    
    Object.entries(landuse_data).forEach(([category, values]) => {
      const sum = values.reduce((acc, val) => acc + val, 0);
      category_sums[category] = sum;
      total_sum += sum;
    });
    
    const threshold = total_sum * 0.01;
    const major_categories = [];
    const minor_categories = [];
    
    Object.entries(category_sums).forEach(([category, sum]) => {
      if (sum >= threshold) {
        major_categories.push(category);
      } else {
        minor_categories.push(category);
      }
    });
    
    // Build chart data for major categories
    major_categories.forEach(category => {
      const values = landuse_data[category];
      
      chartData_landuse.push({
        label: category,
        Low: values[0],
        'Low-med': values[1], 
        'High-med': values[2],
        High: values[3]
      });
    });
    
    // Add "Other" category if there are minor categories
    if (minor_categories.length > 0) {
      const other_values = [0, 0, 0, 0];
      
      minor_categories.forEach(category => {
        const values = landuse_data[category];
        other_values[0] += values[0];
        other_values[1] += values[1]; 
        other_values[2] += values[2];
        other_values[3] += values[3];
      });
      
      chartData_landuse.push({
        label: 'Other',
        Low: other_values[0],
        'Low-med': other_values[1],
        'High-med': other_values[2], 
        High: other_values[3]
      });
    }
  }

  return { chartData_areas_transposed, chartData_landuse };
};
