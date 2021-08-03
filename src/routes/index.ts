import { Router } from 'express';
import { TagRoutes } from './tag-routes';
import { UsersRoutes } from './users-routes';
import { ProfilesRoutes } from './profiles-routes';
import { ArticlesRoutes } from './articles-routes';
import { TestDataRoutes } from './test-data-routes';
import { TestListRoutes } from './test-list-routes';
import { UserTestMappingRoutes } from './user-test-mapping-routes';


const router: Router = Router();


router.use('/tags', TagRoutes);
router.use('/', UsersRoutes);
router.use('/mapping', UserTestMappingRoutes);
router.use('/testData', TestDataRoutes);
router.use('/testList', TestListRoutes);
router.use('/profiles', ProfilesRoutes);
router.use('/articles', ArticlesRoutes);


export const MainRouter: Router = router;
