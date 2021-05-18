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

const Button = ({className = '', href, target, children}) => (
  <div className="pluginWrapper buttonWrapper">
    <a className={["button", className].join(' ')} href={href} target={target}>
      {children}
    </a>
  </div>
);

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

const LogoSvg = ({style}) => (
  <svg style={style} viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(280.822 -299.303)">
      <text
        style={{
          lineHeight: "0%",
          InkscapeFontSpecification: "'Ubuntu, Medium'",
          textAlign: "start",
        }}
        fontFamily="Ubuntu"
        x="-227.697"
        y="343.108"
      >
        <tspan
          style={{
            lineHeight: "100%",
            InkscapeFontSpecification: "'Ubuntu, Medium'",
            textAlign: "start",
          }}
          fontSize="37.5"
          x="-227.697"
          y="343.108"
        >
          Unleash
        </tspan>
      </text>
      <rect
        height="22.483"
        width="40.186"
        fill="#0b1700"
        rx="9.74"
        x="-272.312"
        y="318.151"
      />
      <rect
        height="12.604"
        width="14.489"
        fill="#fff"
        rx="4.135"
        x="-251.511"
        y="323.352"
      />
    </g>
  </svg>
);

const ProjectTitle = () => (
  <h2 className="projectTitle">
    <img src={imgUrl('Logo_DarkBlue_Transparent_Horizontal.png')} alt="Unleash" width="400" />
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
          <Survey />
          <ProjectTitle />
          <a
              className="github-button"
              href={siteConfig.repoUrl}
              data-size="large"
              data-count-href="/unleash/unleash/stargazers"
              data-show-count="true"
              data-count-aria-label="# stargazers on GitHub"
              aria-label="Star this project on GitHub">
              Star
            </a>
          <FeatureCallout />
          <PromoSection>
            <Button className="primary" href={docUrl('deploy/getting_started', language)}>Getting Started</Button>
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
  <div className="productShowcaseSection" style={{textAlign: 'center'}}>
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

const Survey = () => (
  <div className="productShowcaseSection">
    <p className="alert alert-warning">
      Support us in making Unleash even better by participating in this&nbsp;
      <a href="https://docs.google.com/forms/d/e/1FAIpQLSeCM5RUG-r8x4iynYNAlge_RCI77NDg61t28rixV3BBgVra0w/viewform" target="_blank">
        Unleash Open-Source survey.
      </a>&nbsp;
      By participating you will also have the chance to win a $25 Amazon gift card.
    </p>
  </div>
);

const SASSOffering = () => (
  <div className="productShowcaseSection">
    <p className="alert alert-primary">
      Unleash also comes in a enterprise edition with additional features and a hosted option. <br />
      Check out&nbsp;
      <a href="https://www.unleash-hosted.com/pricing">unleash-hosted.com</a>
    </p>
  </div>
);

const UnleashClient = () => (
  <Container padding={['bottom', 'top']} id="unleash-client" background={'light'}>

    <h2>Client SDK</h2>
    <p>
      Unleash has official SDK for Java, Node.js, Go, Ruby, Python and .Net. And we will be happy to add implementations in other languages written by you! These libraries make it very easy to use Unleash in your application.
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
            <li><MarkdownBlock>[cognitedata/unleash-client-rust](https://github.com/cognitedata/unleash-client-rust) (Rust)</MarkdownBlock></li>
            <li><MarkdownBlock>[uekoetter.dev/unleash-client-dart](https://pub.dev/packages/unleash) (Dart)</MarkdownBlock></li>
            <li><MarkdownBlock>[silvercar/unleash-client-kotlin](https://github.com/silvercar/unleash-client-kotlin) (Kotlin)</MarkdownBlock></li>
            <li><MarkdownBlock>[minds/unleash-client-php](https://gitlab.com/minds/unleash-client-php) (PHP)</MarkdownBlock></li>
            <li><MarkdownBlock>[afontaine/unleash_ex](https://gitlab.com/afontaine/unleash_ex) (Elixir)</MarkdownBlock></li>
            <li><MarkdownBlock>[mikefrancis/laravel-unleash](https://github.com/mikefrancis/laravel-unleash) (Laravel - PHP)</MarkdownBlock></li>
            <li><MarkdownBlock>[AppsFlyer/clojure-unleash](https://github.com/AppsFlyer/unleash-client-clojure) (Clojure)</MarkdownBlock></li>
            <li><MarkdownBlock>[pmb0/nestjs-unleash](https://github.com/pmb0/nestjs-unleash) (NestJS - Node.js)</MarkdownBlock></li>
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
        
        <div className="mainContainer" style={{ paddingTop: 0 }}>
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
