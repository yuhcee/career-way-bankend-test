/* eslint-disable indent */
const { APP_FRONTEND_URL } = process.env;

/**
 *
 * @param {an array of one object} datas
 * @param {the title of the table} title
 *
 *  */
export const generateTabularTemplate = (datas, title) => `
<html>
  <head>
    <style>
    body{
      display: table;
      width: 100%;
      background: green;
      text-align: center;
    }
    *{ 
      -webkit-box-sizing: border-box; /* Safari/Chrome, other WebKit */
      -moz-box-sizing: border-box;    /* Firefox, other Gecko */
      box-sizing: border-box;         /* Opera/IE 8+ */
    }
    .aa_h2{
      font:100 2rem/1 Roboto;
      text-transform: uppercase;
        text-align: center;
        color: #fff;
    }
    .color-white { color: #fff; }
    .link { color: red; }
    table{
        background: #fff;
    }
    table,thead,tbody,tfoot,tr, td,th{
      text-align: center;
      margin: auto;
      border:1px solid #dedede;
      padding: 1rem;
      width: 50%;
    }
    .table    { display: table; width: 50%; }
    .tr       { display: table-row;  }
    .thead    { display: table-header-group }
    .tbody    { display: table-row-group }
    .col      { display: table-column }
    .colgroup { display: table-column-group }
    .td, .th   { display: table-cell; width: 50%; }
    .caption  { display: table-caption }   
    .table,
    .thead,
    .tbody,
    .tr,
    .td,
    .th{
      text-align: center;
      margin: auto;
      padding: 1rem;
    }
    .table{
      background: #fff;
      margin: auto;
      border:none;
      padding: 0;
      margin-bottom: 5rem;
    }  
    .th{
      font-weight: 700;
      border:1px solid #dedede;
      &:nth-child(odd){
        border-right:none;
      }
    }
    .td{
      font-weight: 300;
      border:1px solid #dedede;
      border-top:none;
      &:nth-child(odd){
        border-right:none;
      }
    }
    .aa_htmlTable{
      background: #003883;
      padding: 5rem;
      display: table;
      width: 100%;
      height: 70vh;
      vertical-align: middle;
    }
    .center {
      display: block;
      text-align: center;
    }
    </style>
  </head>
  <body>
    <div class="aa_htmlTable">
      <h2 class="aa_h2">Access Gateway</h2>
      <p class="color-white">${title}</p>
      <table>
        <thead>
          <tr>
            ${Object.keys(datas[0])
              .map((data) => `<th>${data}</th>`)
              .join(' ')}
          </tr>
        </thead>
        <tbody>
        ${datas.map(
          (obj) =>
            `<tr>
            ${Object.keys(obj)
              .map(
                (key) => `    
            <td>${obj[key]}</td>     
          `
              )
              .join(' ')}
          </tr>`
        )}
      </tbody>
    </table>
    <br />
    <strong class="color-white center">For more details, click <a class="link" href="${APP_FRONTEND_URL}">here</a></strong>
  </div>
  </body>
</html>
`;
