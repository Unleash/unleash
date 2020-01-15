/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');

const MarkdownBlock = CompLibrary.MarkdownBlock; /* Used to read markdown */
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

const siteConfig = require(`${process.cwd()}/siteConfig.js`);

function imgUrl(img) {
  return `${siteConfig.baseUrl}img/${img}`;
}

function docUrl(doc, language) {
  return `${siteConfig.baseUrl}docs/${language ? `${language}/` : ''}${doc}`;
}

function pageUrl(page, language) {
  return siteConfig.baseUrl + (language ? `${language}/` : '') + page;
}

class Button extends React.Component {
  render() {
    return (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={this.props.href} target={this.props.target}>
          {this.props.children}
        </a>
      </div>
    );
  }
}

Button.defaultProps = {
  target: '_self',
};

const SplashContainer = props => (
  <div className="homeContainer">
    <div className="homeSplashFade">
      <div className="wrapper homeWrapper">{props.children}</div>
    </div>
  </div>
);

const Logo = props => (
  <div className="projectLogo">
    <img src={props.img_src} alt="Project Logo" />
  </div>
);

const ProjectTitle = () => (
  <h2 className="projectTitle">
    {siteConfig.title}
    <small>{siteConfig.tagline}</small>
  </h2>
);

const PromoSection = props => (
  <div className="section promoSection">
    <div className="promoRow">
      <div className="pluginRowBlock">{props.children}</div>
    </div>
  </div>
);

class HomeSplash extends React.Component {
  render() {
    const language = this.props.language || '';
    return (
      <SplashContainer>
        <div className="inner">
          <ProjectTitle />
          <a
              className="github-button"
              href={siteConfig.repoUrl}
              data-icon="octicon-star"
              data-count-href="/unleash/unleash/stargazers"
              data-show-count="true"
              data-count-aria-label="# stargazers on GitHub"
              aria-label="Star this project on GitHub">
              Star
            </a>
          <PromoSection>
            <Button href={docUrl('getting_started.html', language)}>Getting Started</Button>
            <Button href="#try">Try It Out</Button>
            <Button href={siteConfig.repoUrl}>GitHub</Button>
          </PromoSection>
        </div>
      </SplashContainer>
    );
  }
}

const Block = props => (
  <Container
    padding={['bottom', 'top']}
    id={props.id}
    background={props.background}>
    <GridBlock align="left" contents={props.children} layout={props.layout} />
  </Container>
);

const FeatureCallout = () => (
  <div className="productShowcaseSection paddingBottom" style={{textAlign: 'center'}}>
    <p>
      Unleash is a feature toggle system, that gives you a great overview of all feature toggles across 
      all your applications and services. It comes with official client implementations for Java, Node.js, Go, Ruby, Python and .Net.
    </p>
    <p>
      The main motivation for doing feature toggling is to decouple the process for deploying code to production 
      and releasing new features. This helps reducing risk, and allow us to easily manage which features to enable
    </p>
  </div>
);

const UnleashClient = () => (
  <Container padding={['bottom', 'top']} id="unleash-client" background={'light'}>

    <h2>Client implementations</h2>
    <p>
      Unleash has official SDK's for Java, Node.js, Go, Ruby, Python and .Net. And we will be happy to add implementations in other languages written by you! These libraries make it very easy to use Unleash in your application.
    </p>
    
    <div className="gridBlock">
      <div className="blockElement twoByGridBlock">
        <div className="blockContent">
          <h3>Official client SDKs:</h3>
          <ul>
            <li><MarkdownBlock>[unleash/unleash-client-java](https://github.com/unleash/unleash-client-java)</MarkdownBlock></li>
            <li><MarkdownBlock>[unleash/unleash-client-node](https://github.com/unleash/unleash-client-node)</MarkdownBlock></li>
            <li><MarkdownBlock>[unleash/unleash-client-go](https://github.com/unleash/unleash-client-go)</MarkdownBlock></li>
            <li><MarkdownBlock>[unleash/unleash-client-ruby](https://github.com/unleash/unleash-client-ruby)</MarkdownBlock></li>
            <li><MarkdownBlock>[unleash/unleash-client-python](https://github.com/Unleash/unleash-client-python)</MarkdownBlock></li>
            <li><MarkdownBlock>[unleash/unleash-client-core](https://github.com/Unleash/unleash-client-core) (.Net Core)</MarkdownBlock></li>
          </ul>    
        </div>
      </div>
      
      <div className="blockElement twoByGridBlock">
        <div className="blockContent">
          <h3>Clients written by awesome enthusiasts:</h3>
          <ul>
            <li><MarkdownBlock>[afontaine/unleash_ex](https://gitlab.com/afontaine/unleash_ex) (Elixir)</MarkdownBlock></li>
            <li><MarkdownBlock>[mikefrancis/laravel-unleash](https://github.com/mikefrancis/laravel-unleash) (Laravel - PHP)</MarkdownBlock></li>
          </ul>
        </div>
      </div>
    </div>
  </Container>
);

const TryOut = () => (
  <Block id="try">
    {[
      {
        content: 'We have deployed a demo version of [Unleash on Heroku](https://unleash.herokuapp.com). '+
            'Here you can play with the Unleash UI, define some feature toggles and get a feel of how to use Unleash. <br /><br />'+
            'It is even possible to use one of the Unleash client SDKs and test it out Unleash your application. '+
            'To do this, you should connect one of the clients using the hosted API URL: https://unleash.herokuapp.com/api/.',
        image: imgUrl('dashboard_new.png'),
        imageAlign: 'left',
        align: 'left',
        title: 'Try Unleash',
      },
    ]}
  </Block>
);

const ActivationStrategies = () => (
  <Block background="dark">
    {[
      {
        content: 'It\'s great to have a system for turning stuff on and off. Sometimes, however, we want more granular control, and we want to decide who the toggle should be enabled for. This is where activation strategies come into the picture. Activation strategies take arbitrary config and allow us to enable a toggle in various ways.',
        image: imgUrl('logo-inverted.png'),
        imageAlign: 'right',
        title: 'Activation strategies',
      },
    ]}
  </Block>
);

const Showcase = props => {
  if ((siteConfig.users || []).length === 0) {
    return null;
  }

  const showcase = siteConfig.users.filter(user => user.pinned).map(user => (
    <a href={user.infoLink} key={user.infoLink}>
      <img src={user.image} alt={user.caption} title={user.caption} />
    </a>
  ));

  return (
    <div className="productShowcaseSection paddingBottom">
      <h2>Who is Using Unleash?</h2>
      <p>Unleash is used by</p>
      <div className="logos">{showcase}</div>
      <div className="more-users">
        <a className="button" href={pageUrl('users.html', props.language)}>
          More {siteConfig.title} Users
        </a>
      </div>
    </div>
  );
};

class Index extends React.Component {
  render() {
    const language = this.props.language || '';

    return (
      <div>
        <HomeSplash language={language} config={this.props.config} />
        <div className="mainContainer">
          <FeatureCallout />
          <UnleashClient />
          <TryOut />
          <ActivationStrategies />
          <Showcase language={language} />
        </div>
      </div>
    );
  }
}

module.exports = Index;
