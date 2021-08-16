import { NextFunction, Router, Request, Response } from 'express';
import { TagRoutes } from './tag-routes';
import { UsersRoutes } from './users-routes';
import { ProfilesRoutes } from './profiles-routes';
import { ArticlesRoutes } from './articles-routes';
import { TestDataRoutes } from './test-data-routes';
import { TestListRoutes } from './test-list-routes';
import { UserTestMappingRoutes } from './user-test-mapping-routes';


const router: Router = Router();

const middleware = (req: Request, res: Response, next: NextFunction) => {
    const {headers}: any = req
    if(headers && headers.secure && headers.secure === 'ATHARV') {
        return next()
    }
    return res.status(401).json({staus: false, msg: 'Failed to autheticate API. Please verify once again', data:{}})
}

// router.use(middleware)
router.use('/tags', TagRoutes);
router.use('/', UsersRoutes);
router.use('/mapping', UserTestMappingRoutes);
router.use('/testData', TestDataRoutes);
router.use('/testList', TestListRoutes);
router.use('/profiles', ProfilesRoutes);
router.use('/articles', ArticlesRoutes);


export const MainRouter: Router = router;
