export const getNextRoute = (currentRoute, startingFilter) => {
  const regionFirstOrder = ['/region', '/subregion', '/superspecies', '/dataset', '/adm0', '/adm1', '/final'];
  const superspeciesFirstOrder = ['/superspecies', '/region', '/subregion', '/dataset', '/adm0', '/adm1', '/final'];
  
  const order = startingFilter === 'region' ? regionFirstOrder : superspeciesFirstOrder;
  const currentIndex = order.indexOf(currentRoute);
  
  return currentIndex < order.length - 1 ? order[currentIndex + 1] : '/final';
};

export const getPreviousRoute = (currentRoute, startingFilter) => {
  const regionFirstOrder = ['/region', '/subregion', '/superspecies', '/dataset', '/adm0', '/adm1', '/final'];
  const superspeciesFirstOrder = ['/superspecies', '/region', '/subregion', '/dataset', '/adm0', '/adm1', '/final'];
  
  const order = startingFilter === 'region' ? regionFirstOrder : superspeciesFirstOrder;
  const currentIndex = order.indexOf(currentRoute);
  
  return currentIndex > 0 ? order[currentIndex - 1] : '/';
};
