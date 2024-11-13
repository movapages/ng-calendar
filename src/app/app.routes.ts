import {Routes} from '@angular/router';
import {LayoutComponent} from './layout/layout.component';
import {HomeComponent} from './home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {path: '', component: HomeComponent},
      {
        path: 'about',
        loadComponent: () => import('./about/about.component')
          .then((m) => m.AboutComponent),
        children: [
          {
            path: 'details', loadComponent: () => import('./about/details/details.component')
              .then((m) => m.DetailsComponent),
          }
        ]
      },
    ],
  }
];
