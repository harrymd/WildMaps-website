export const getNextRoute = (currentRoute, startingFilter) => {
  // Updated to skip adm0 and adm1 - go directly from dataset to final
  const regionFirstOrder = ['/region', '/subregion', '/superspecies', '/dataset', '/final'];
  const superspeciesFirstOrder = ['/superspecies', '/region', '/subregion', '/dataset', '/final'];
  
  const order = startingFilter === 'region' ? regionFirstOrder : superspeciesFirstOrder;
  const currentIndex = order.indexOf(currentRoute);
  
  return currentIndex < order.length - 1 ? order[currentIndex + 1] : '/final';
};

export const getPreviousRoute = (currentRoute, startingFilter) => {
  // Updated to skip adm0 and adm1 - go directly from final back to dataset
  const regionFirstOrder = ['/region', '/subregion', '/superspecies', '/dataset', '/final'];
  const superspeciesFirstOrder = ['/superspecies', '/region', '/subregion', '/dataset', '/final'];
  
  const order = startingFilter === 'region' ? regionFirstOrder : superspeciesFirstOrder;
  const currentIndex = order.indexOf(currentRoute);
  
  return currentIndex > 0 ? order[currentIndex - 1] : '/';
};
