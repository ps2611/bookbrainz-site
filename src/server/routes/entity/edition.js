/*
 * Copyright (C) 2015       Ben Ockmore
 *               2015-2016  Sean Burke
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

'use strict';

const Promise = require('bluebird');

const React = require('react');
const ReactDOMServer = require('react-dom/server');
const express = require('express');
const _ = require('lodash');

const bookbrainzData = require('bookbrainz-data');
const {
	Edition, EditionHeader, EditionRevision, LanguageSet, Publication,
	Publisher, PublisherSet, ReleaseEventSet
} = bookbrainzData;

const auth = require('../../helpers/auth');
const utils = require('../../helpers/utils');

const entityRoutes = require('./entity');

/* Middleware loader functions. */
const loadEditionFormats =
	require('../../helpers/middleware').loadEditionFormats;
const loadEditionStatuses =
	require('../../helpers/middleware').loadEditionStatuses;
const loadEntityRelationships =
	require('../../helpers/middleware').loadEntityRelationships;
const loadIdentifierTypes =
	require('../../helpers/middleware').loadIdentifierTypes;
const loadLanguages =
	require('../../helpers/middleware').loadLanguages;
const makeEntityLoader = require('../../helpers/middleware').makeEntityLoader;

const EditForm = React.createFactory(
	require('../../../client/components/forms/edition')
);

const router = express.Router();

/* If the route specifies a BBID, load the Edition for it. */
router.param(
	'bbid',
	makeEntityLoader(
		Edition,
		[
			'publication.defaultAlias',
			'languageSet.languages',
			'editionFormat',
			'editionStatus',
			'releaseEventSet.releaseEvents',
			'publisherSet.publishers.defaultAlias'
		],
		'Edition not found'
	)
);

function _setEditionTitle(res) {
	res.locals.title = utils.createEntityPageTitle(
		res.locals.entity,
		'Edition',
		utils.template`Edition “${'name'}”`
	);
}

router.get('/:bbid', loadEntityRelationships, (req, res) => {
	_setEditionTitle(res);
	entityRoutes.displayEntity(req, res);
});

router.get('/:bbid/revisions', (req, res, next) => {
	_setEditionTitle(res);
	entityRoutes.displayRevisions(req, res, next, EditionRevision);
});

router.get('/:bbid/delete', auth.isAuthenticated, (req, res) => {
	_setEditionTitle(res);
	entityRoutes.displayDeleteEntity(req, res);
});

router.post('/:bbid/delete/handler', auth.isAuthenticatedForHandler,
	(req, res) =>
		entityRoutes.handleDelete(req, res, EditionHeader, EditionRevision)
);

// Creation

router.get('/create', auth.isAuthenticated, loadIdentifierTypes,
	loadEditionStatuses, loadEditionFormats, loadLanguages,
	(req, res, next) => {
		const propsPromise = {
			editionFormats: res.locals.editionFormats,
			editionStatuses: res.locals.editionStatuses,
			identifierTypes: res.locals.identifierTypes,
			languages: res.locals.languages,
			submissionUrl: '/edition/create/handler'
		};

		if (req.query.publication) {
			propsPromise.publication =
				Publication.forge({bbid: req.query.publication})
					.fetch({withRelated: 'defaultAlias'});
		}

		if (req.query.publisher) {
			propsPromise.publisher =
				Publisher.forge({bbid: req.query.publisher})
					.fetch({withRelated: 'defaultAlias'});
		}

		function render(props) {
			const markup = ReactDOMServer.renderToString(EditForm(props));

			res.render('entity/create/create-common', {
				heading: 'Create Edition',
				markup,
				props,
				script: 'edition',
				subheading: 'Add a new Edition to BookBrainz',
				title: 'Add Edition'
			});
		}

		Promise.props(propsPromise)
			.then(render)
			.catch(next);
	}
);

router.get('/:bbid/edit', auth.isAuthenticated, loadIdentifierTypes,
	loadEditionStatuses, loadEditionFormats, loadLanguages, (req, res) => {
		const edition = res.locals.entity;

		const props = {
			edition,
			editionFormats: res.locals.editionFormats,
			editionStatuses: res.locals.editionStatuses,
			identifierTypes: res.locals.identifierTypes,
			languages: res.locals.languages,
			submissionUrl: `/edition/${edition.bbid}/edit/handler`
		};

		const markup = ReactDOMServer.renderToString(EditForm(props));

		res.render('entity/create/create-common', {
			heading: 'Edit Edition',
			markup,
			props,
			script: 'edition',
			subheading: 'Edit an existing Edition in BookBrainz',
			title: 'Edit Edition'
		});
	}
);

const additionalEditionProps = [
	'publicationBbid', 'width', 'height', 'depth', 'weight', 'pages',
	'formatId', 'statusId'
];

const additionalEditionSets = [
	{
		entityIdField: 'languageSetId',
		idField: 'id',
		model: LanguageSet,
		name: 'languageSet',
		propName: 'languages'
	},
	{
		entityIdField: 'publisherSetId',
		idField: 'bbid',
		model: PublisherSet,
		name: 'publisherSet',
		propName: 'publishers'
	},
	{
		entityIdField: 'releaseEventSetId',
		idField: 'id',
		model: ReleaseEventSet,
		mutableFields: [
			'date',
			'areaId'
		],
		name: 'releaseEventSet',
		propName: 'releaseEvents'
	}
];

router.post('/create/handler', auth.isAuthenticatedForHandler, (req, res) =>
	entityRoutes.createEntity(
		req,
		res,
		'Edition',
		_.pick(req.body, additionalEditionProps),
		additionalEditionSets
	)
);

router.post('/:bbid/edit/handler', auth.isAuthenticatedForHandler, (req, res) =>
	entityRoutes.editEntity(
		req,
		res,
		'Edition',
		_.pick(req.body, additionalEditionProps),
		additionalEditionSets
	)
);

module.exports = router;
