export const getJsonFromUrl = (url) => {
   if (!url) {
      return {};
   }
   const query = url.substr(1);
   return query.split('&').reduce((acc, part) => {
      const item = part.split('=');
      acc[item[0]] = decodeURIComponent(item[1]);
      return acc;
   }, {});
};
