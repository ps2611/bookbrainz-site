/*
 * Copyright (C) 2016  Max Prettyjohns
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

import * as testData from '../data/test-data.js';
import Promise from 'bluebird';
import bookbrainzData from './bookbrainz-data';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import rewire from 'rewire';

chai.use(chaiAsPromised);
const {expect} = chai;
const {Editor} = bookbrainzData;

const Achievement = rewire('../src/server/helpers/achievement.js');

const explorerIThreshold = 10;
const explorerIIThreshold = 100;
const explorerIIIThreshold = 1000;

export default function tests() {
	beforeEach(() => testData.createEditor()
		.then(() =>
			testData.createExplorer()
		)
	);

	afterEach(testData.truncate);

	it('I should be given to someone with 10 entity views', () => {
		Achievement.__set__({
			getEntityVisits: () => Promise.resolve(explorerIThreshold)
		});

		const achievementPromise = new Editor({
			name: testData.editorAttribs.name
		})
			.fetch()
			.then((editor) =>
				Achievement.processPageVisit(editor.id)
			)
			.then((edit) =>
				edit.explorer['Explorer I']
			);

		return Promise.all([
			expect(achievementPromise).to.eventually.have
			.property('editorId', testData.editorAttribs.id),
			expect(achievementPromise).to.eventually.have
			.property('achievementId',
					testData.explorerIAttribs.id)
		]);
	});

	it('II should be given to someone with 100 entity views', () => {
		Achievement.__set__({
			getEntityVisits: () => Promise.resolve(explorerIIThreshold)
		});

		const achievementPromise = new Editor({
			name: testData.editorAttribs.name
		})
			.fetch()
			.then((editor) =>
				Achievement.processPageVisit(editor.id)
			)
			.then((edit) =>
				edit.explorer['Explorer II']
			);

		return Promise.all([
			expect(achievementPromise).to.eventually.have
			.property('editorId', testData.editorAttribs.id),
			expect(achievementPromise).to.eventually.have
			.property('achievementId',
					testData.explorerIIAttribs.id)
		]);
	});

	it('III should be given to someone with 1000 entity views',
		() => {
			Achievement.__set__({
				getEntityVisits: () => Promise.resolve(explorerIIIThreshold)
			});

			const achievementPromise = new Editor({
				name: testData.editorAttribs.name
			})
				.fetch()
				.then((editor) =>
					Achievement.processPageVisit(editor.id)
				)
				.then((edit) =>
					edit.explorer['Explorer III']
				);

			return Promise.all([
				expect(achievementPromise).to.eventually.have
				.property('editorId', testData.editorAttribs.id),
				expect(achievementPromise).to.eventually.have
				.property('achievementId',
						testData.explorerIIIAttribs.id)
			]);
		});

	it('I should not be given to someone with 9 entity views', () => {
		Achievement.__set__({
			getEntityVisits: () => Promise.resolve(explorerIThreshold - 1)
		});

		const achievementPromise = new Editor({
			name: testData.editorAttribs.name
		})
			.fetch()
			.then((editor) =>
				Achievement.processPageVisit(editor.id)
			)
			.then((edit) =>
				edit.explorer['Explorer I']
			);

		return expect(achievementPromise).to.eventually.equal(false);
	});
}
